import AsyncStorage from '@react-native-async-storage/async-storage';
import DesempenhoIAService, { consolidar } from '../src/services/DesempenhoIAService';
import TrechosService from '../src/services/TrechosService';
import MockScenarioService from '../src/services/MockScenarioService';
import { CENARIOS } from '../src/mocks/mockScenarios';
import { Relogio } from '../src/utils/datas';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('DesempenhoIAService', () => {
  beforeEach(async () => {
    jest.spyOn(Relogio, 'agora').mockReturnValue(new Date(2026, 5, 16, 10, 0));
    await AsyncStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('consolida o histórico de feedbacks em taxa de acerto', async () => {
    const resumo = await DesempenhoIAService.getResumo();
    expect(resumo.total).toBe(12);
    expect(resumo.acertos).toBe(9);
    expect(resumo.taxaAcerto).toBe(75);
    expect(resumo.porTrecho).toHaveLength(5);
    expect(resumo.porNivel.map((n) => n.nivel)).toEqual(['Urgente', 'Atenção', 'Não necessária']);
  });

  it('um feedback registrado no app entra no cálculo', async () => {
    await TrechosService.registerFeedback('trecho-1', { podaRealizada: true, previsaoCorreta: false });
    const resumo = await DesempenhoIAService.getResumo();

    expect(resumo.total).toBe(13);
    expect(resumo.erros).toBe(4);
    expect(resumo.registradosNoApp).toBe(1);
    expect(resumo.recentes[0]).toMatchObject({ trechoId: 'trecho-1', nivelPrevisto: 'Urgente', tecnico: 'Você' });
  });

  it('sem feedbacks a taxa é nula (e não 0%)', () => {
    expect(consolidar([], []).taxaAcerto).toBeNull();
  });

  it('respeita os cenários de mock', async () => {
    await MockScenarioService.setCenario(CENARIOS.VAZIO);
    expect((await DesempenhoIAService.getResumo()).total).toBe(0);

    await MockScenarioService.setCenario(CENARIOS.ERRO);
    await expect(DesempenhoIAService.getResumo()).rejects.toThrow();
  });
});
