import AsyncStorage from '@react-native-async-storage/async-storage';
import TrechosService from '../src/services/TrechosService';
import { gerarTrechosMock } from '../src/mocks/trechosMock';
import { Relogio } from '../src/utils/datas';

// Dia fixo (terça, 16/06/2026) para o mock e a previsão serem determinísticos.
const AGORA = new Date(2026, 5, 16, 10, 0);
const TRECHOS_MOCK = gerarTrechosMock(AGORA);

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const STORAGE_KEY = '@prognosisherba:trechos';

describe('TrechosService', () => {
  beforeEach(async () => {
    jest.spyOn(Relogio, 'agora').mockReturnValue(AGORA);
    await AsyncStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('getTrechos seeds AsyncStorage with mock data on first call', async () => {
    const trechos = await TrechosService.getTrechos();
    expect(trechos.map(({ previsaoIA, ...t }) => t)).toEqual(TRECHOS_MOCK);

    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    expect(JSON.parse(stored)).toEqual(TRECHOS_MOCK);
  });

  it('mock dates are relative to the current day', async () => {
    const trechos = await TrechosService.getTrechos();
    const trecho1 = trechos.find((t) => t.id === 'trecho-1');
    expect(trecho1.ultimaInspecao).toBe('2026-06-02');
  });

  it('getTrechos returns persisted data on subsequent calls', async () => {
    await TrechosService.getTrechos();
    const trechos = await TrechosService.getTrechos();
    expect(trechos.length).toBe(TRECHOS_MOCK.length);
  });

  it('getTrechos calcula a previsão de IA na leitura e não a persiste', async () => {
    const trechos = await TrechosService.getTrechos();
    trechos.forEach((trecho) => {
      expect(trecho.previsaoIA).toMatchObject({
        nivel: expect.any(String),
        confianca: expect.any(Number),
        motivo: expect.any(String),
      });
    });

    const stored = JSON.parse(await AsyncStorage.getItem(STORAGE_KEY));
    stored.forEach((trecho) => {
      expect(trecho.previsaoIA).toBeUndefined();
      expect(trecho.feedbackPodador).toBeTruthy();
    });
  });

  it('re-semeia dados de versões antigas (Sprint 3, datas fixas de junho)', async () => {
    const antigos = TRECHOS_MOCK.map((t) => ({ ...t, ultimaInspecao: '2020-01-01' }));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(antigos));

    const trechos = await TrechosService.getTrechos();
    expect(trechos[0].ultimaInspecao).toBe(TRECHOS_MOCK[0].ultimaInspecao);
  });

  it('registerInspecao recalcula a previsão de IA do trecho', async () => {
    const antes = await TrechosService.getTrechoById('trecho-1');
    expect(antes.previsaoIA.nivel).toBe('Urgente');

    const depois = await TrechosService.registerInspecao('trecho-1', {
      status: 'Conforme',
      observacao: 'Poda realizada e placa liberada.',
      tecnico: 'João Silva',
    });
    expect(depois.previsaoIA.nivel).toBe('Não necessária');
  });

  it('registerInspecao guarda a foto anexada', async () => {
    const updated = await TrechosService.registerInspecao('trecho-2', {
      status: 'Atenção',
      observacao: 'Foto da faixa lateral.',
      tecnico: 'João Silva',
      foto: 'file:///foto.jpg',
    });
    expect(updated.historico[0].foto).toBe('file:///foto.jpg');
  });

  it('registerFeedback guarda o nível que a IA previa no momento', async () => {
    const updated = await TrechosService.registerFeedback('trecho-4', {
      podaRealizada: true,
      previsaoCorreta: true,
    });
    expect(updated.feedbackPodador.nivelPrevisto).toBe('Urgente');
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
