import * as Location from 'expo-location';
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
});
