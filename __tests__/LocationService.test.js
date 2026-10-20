import * as Location from 'expo-location';
import { Linking, Platform } from 'react-native';
import LocationService from '../src/services/LocationService';

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

describe('LocationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentPosition', () => {
    it('returns coordinates when permission is granted', async () => {
      Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Location.getCurrentPositionAsync.mockResolvedValue({
        coords: { latitude: -23.5, longitude: -46.6 },
      });

      const position = await LocationService.getCurrentPosition();

      expect(position).toEqual({ latitude: -23.5, longitude: -46.6 });
    });

    it('returns null when permission is denied', async () => {
      Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });

      const position = await LocationService.getCurrentPosition();

      expect(position).toBeNull();
      expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
    });
  });

  describe('getDistanceKm', () => {
    it('returns 0 for identical coordinates', () => {
      const point = { latitude: -23.1857, longitude: -46.8979 };
      expect(LocationService.getDistanceKm(point, point)).toBe(0);
    });

    it('returns the approximate distance between two known points', () => {
      // São Paulo (Praça da Sé) -> Jundiaí (centro), ~50km em linha reta
      const saoPaulo = { latitude: -23.5505, longitude: -46.6333 };
      const jundiai = { latitude: -23.1857, longitude: -46.8979 };

      const distance = LocationService.getDistanceKm(saoPaulo, jundiai);

      expect(distance).toBeGreaterThan(40);
      expect(distance).toBeLessThan(60);
    });
  });

  describe('abrirNoMapa (Sprint 4)', () => {
    const trecho = { latitude: -23.1857, longitude: -46.8979, nomeTrecho: 'Trecho Jundiaí' };

    it('no Android abre o esquema geo: com o nome do trecho', async () => {
      Platform.OS = 'android';
      const spy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
      const url = await LocationService.abrirNoMapa(trecho);
      expect(url).toBe('geo:-23.1857,-46.8979?q=-23.1857,-46.8979(Trecho%20Jundia%C3%AD)');
      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockRestore();
    });

    it('cai para o Google Maps web quando nenhum app trata geo:', async () => {
      Platform.OS = 'android';
      const spy = jest
        .spyOn(Linking, 'openURL')
        .mockRejectedValueOnce(new Error('No Activity found'))
        .mockResolvedValueOnce(true);
      const url = await LocationService.abrirNoMapa(trecho);
      expect(url).toBe('https://www.google.com/maps/search/?api=1&query=-23.1857,-46.8979');
      spy.mockRestore();
    });
  });
});
