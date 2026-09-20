import AsyncStorage from '@react-native-async-storage/async-storage';
import MockScenarioService from '../src/services/MockScenarioService';
import TrechosService from '../src/services/TrechosService';
import { CENARIOS, CENARIO_PADRAO } from '../src/mocks/mockScenarios';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('MockScenarioService', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('usa o cenário de sucesso como padrão', async () => {
    expect(await MockScenarioService.getCenario()).toBe(CENARIO_PADRAO);
    expect(CENARIO_PADRAO).toBe(CENARIOS.SUCESSO);
  });

  it('persiste o cenário escolhido', async () => {
    await MockScenarioService.setCenario(CENARIOS.ERRO);
    expect(await MockScenarioService.getCenario()).toBe(CENARIOS.ERRO);
  });

  it('ignora um cenário inválido e volta para o padrão', async () => {
    await MockScenarioService.setCenario('cenario-inexistente');
    expect(await MockScenarioService.getCenario()).toBe(CENARIO_PADRAO);
  });

  it('aplicar devolve os dados originais no cenário de sucesso', async () => {
    const dados = [{ id: 1 }];
    expect(await MockScenarioService.aplicar(dados)).toBe(dados);
  });

  it('aplicar devolve a lista vazia no cenário de lista vazia', async () => {
    await MockScenarioService.setCenario(CENARIOS.VAZIO);
    expect(await MockScenarioService.aplicar([{ id: 1 }], { vazio: [] })).toEqual([]);
  });

  it('aplicar lança erro de API no cenário de erro', async () => {
    await MockScenarioService.setCenario(CENARIOS.ERRO);
    await expect(MockScenarioService.aplicar([{ id: 1 }])).rejects.toThrow(/conectar ao servidor/);
  });

  it('aplicarEscrita lança erro de gravação no cenário de erro', async () => {
    await MockScenarioService.setCenario(CENARIOS.ERRO);
    await expect(MockScenarioService.aplicarEscrita({ id: 1 })).rejects.toThrow(/Não foi possível salvar/);
  });
});

describe('TrechosService sob os cenários de mock', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('retorna a lista completa no cenário de sucesso', async () => {
    const trechos = await TrechosService.getTrechos();
    expect(trechos.length).toBeGreaterThan(0);
  });

  it('retorna lista vazia no cenário de lista vazia, sem apagar o storage', async () => {
    await TrechosService.getTrechos();
    await MockScenarioService.setCenario(CENARIOS.VAZIO);

    expect(await TrechosService.getTrechos()).toEqual([]);

    await MockScenarioService.setCenario(CENARIOS.SUCESSO);
    expect((await TrechosService.getTrechos()).length).toBeGreaterThan(0);
  });

  it('falha ao listar trechos no cenário de erro', async () => {
    await MockScenarioService.setCenario(CENARIOS.ERRO);
    await expect(TrechosService.getTrechos()).rejects.toThrow();
  });

  it('não persiste a inspeção quando a gravação falha', async () => {
    await TrechosService.getTrechos();
    await MockScenarioService.setCenario(CENARIOS.ERRO);

    await expect(
      TrechosService.registerInspecao('trecho-1', {
        status: 'Conforme',
        observacao: 'Poda concluída.',
        tecnico: 'João Silva',
      })
    ).rejects.toThrow();

    await MockScenarioService.setCenario(CENARIOS.SUCESSO);
    const trecho = await TrechosService.getTrechoById('trecho-1');
    expect(trecho.statusVegetacao).toBe('Crítico');
  });

  it('resetarDados devolve os trechos ao estado original do mock', async () => {
    await TrechosService.registerInspecao('trecho-1', {
      status: 'Conforme',
      observacao: 'Poda concluída.',
      tecnico: 'João Silva',
    });
    expect((await TrechosService.getTrechoById('trecho-1')).statusVegetacao).toBe('Conforme');

    await TrechosService.resetarDados();
    expect((await TrechosService.getTrechoById('trecho-1')).statusVegetacao).toBe('Crítico');
  });
});
