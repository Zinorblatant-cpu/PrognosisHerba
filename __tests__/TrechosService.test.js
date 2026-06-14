import AsyncStorage from '@react-native-async-storage/async-storage';
import TrechosService from '../src/services/TrechosService';
import { TRECHOS_MOCK } from '../src/mocks/trechosMock';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const STORAGE_KEY = '@prognosisherba:trechos';

describe('TrechosService', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('getTrechos seeds AsyncStorage with mock data on first call', async () => {
    const trechos = await TrechosService.getTrechos();
    expect(trechos).toEqual(TRECHOS_MOCK);

    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    expect(JSON.parse(stored)).toEqual(TRECHOS_MOCK);
  });

  it('getTrechos returns persisted data on subsequent calls', async () => {
    await TrechosService.getTrechos();
    const trechos = await TrechosService.getTrechos();
    expect(trechos.length).toBe(TRECHOS_MOCK.length);
  });

  it('getTrechos backfills previsaoIA and feedbackPodador on data persisted before this feature existed', async () => {
    const trechosAntigos = TRECHOS_MOCK.map(({ previsaoIA, feedbackPodador, ...resto }) => resto);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trechosAntigos));

    const trechos = await TrechosService.getTrechos();
    trechos.forEach((trecho) => {
      expect(trecho.previsaoIA).toBeTruthy();
      expect(trecho.feedbackPodador).toBeTruthy();
    });

    const stored = JSON.parse(await AsyncStorage.getItem(STORAGE_KEY));
    stored.forEach((trecho) => {
      expect(trecho.previsaoIA).toBeTruthy();
      expect(trecho.feedbackPodador).toBeTruthy();
    });
  });

  it('getTrechoById returns the matching trecho', async () => {
    const trecho = await TrechosService.getTrechoById('trecho-2');
    expect(trecho).toMatchObject({ id: 'trecho-2', rodovia: 'Rodovia dos Bandeirantes (SP-348)' });
  });

  it('getTrechoById returns null for unknown id', async () => {
    const trecho = await TrechosService.getTrechoById('trecho-inexistente');
    expect(trecho).toBeNull();
  });

  it('registerInspecao updates statusVegetacao and ultimaInspecao', async () => {
    const updated = await TrechosService.registerInspecao('trecho-3', {
      status: 'Atenção',
      observacao: 'Vegetação voltou a crescer na faixa lateral.',
      tecnico: 'João Silva',
    });

    expect(updated.statusVegetacao).toBe('Atenção');
    expect(updated.historico[0]).toMatchObject({
      status: 'Atenção',
      observacao: 'Vegetação voltou a crescer na faixa lateral.',
      tecnico: 'João Silva',
    });
  });

  it('registerInspecao prepends new entry to historico without removing old ones', async () => {
    const trechoAntes = await TrechosService.getTrechoById('trecho-2');
    const historicoAntes = trechoAntes.historico.length;

    const updated = await TrechosService.registerInspecao('trecho-2', {
      status: 'Conforme',
      observacao: 'Poda concluída.',
      tecnico: 'João Silva',
    });

    expect(updated.historico.length).toBe(historicoAntes + 1);
  });

  it('registerInspecao persists changes to AsyncStorage', async () => {
    await TrechosService.registerInspecao('trecho-1', {
      status: 'Conforme',
      observacao: 'Poda concluída no trecho crítico.',
      tecnico: 'João Silva',
    });

    const stored = JSON.parse(await AsyncStorage.getItem(STORAGE_KEY));
    const trecho1 = stored.find((t) => t.id === 'trecho-1');
    expect(trecho1.statusVegetacao).toBe('Conforme');
  });

  it('registerFeedback stores podaRealizada, previsaoCorreta and dataFeedback', async () => {
    const updated = await TrechosService.registerFeedback('trecho-1', {
      podaRealizada: true,
      previsaoCorreta: true,
    });

    expect(updated.feedbackPodador).toMatchObject({
      podaRealizada: true,
      previsaoCorreta: true,
    });
    expect(updated.feedbackPodador.dataFeedback).toBeTruthy();
  });

  it('registerFeedback persists changes to AsyncStorage', async () => {
    await TrechosService.registerFeedback('trecho-2', {
      podaRealizada: false,
      previsaoCorreta: false,
    });

    const stored = JSON.parse(await AsyncStorage.getItem(STORAGE_KEY));
    const trecho2 = stored.find((t) => t.id === 'trecho-2');
    expect(trecho2.feedbackPodador).toMatchObject({
      podaRealizada: false,
      previsaoCorreta: false,
    });
  });
});
