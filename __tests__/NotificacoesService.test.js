import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificacoesService from '../src/services/NotificacoesService';
import MockScenarioService from '../src/services/MockScenarioService';
import { CENARIOS } from '../src/mocks/mockScenarios';
import { NOTIFICACOES_MOCK } from '../src/mocks/notificacoesMock';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('NotificacoesService', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('getNotificacoes retorna todas as notificações do mock', async () => {
    const lista = await NotificacoesService.getNotificacoes();
    expect(lista.length).toBe(NOTIFICACOES_MOCK.length);
  });

  it('contarNaoLidas reflete o estado inicial do mock', async () => {
    const naoLidas = NOTIFICACOES_MOCK.filter((item) => !item.lida).length;
    expect(await NotificacoesService.contarNaoLidas()).toBe(naoLidas);
  });

  it('marcarComoLida reduz o contador de não lidas', async () => {
    const antes = await NotificacoesService.contarNaoLidas();
    await NotificacoesService.marcarComoLida('notif-1');
    expect(await NotificacoesService.contarNaoLidas()).toBe(antes - 1);
  });

  it('marcarComoLida é idempotente', async () => {
    await NotificacoesService.marcarComoLida('notif-1');
    const depois = await NotificacoesService.contarNaoLidas();
    await NotificacoesService.marcarComoLida('notif-1');
    expect(await NotificacoesService.contarNaoLidas()).toBe(depois);
  });

  it('marcarTodasComoLidas zera o contador', async () => {
    await NotificacoesService.marcarTodasComoLidas();
    expect(await NotificacoesService.contarNaoLidas()).toBe(0);
  });

  it('resetarLeituras devolve o estado original do mock', async () => {
    await NotificacoesService.marcarTodasComoLidas();
    await NotificacoesService.resetarLeituras();

    const naoLidas = NOTIFICACOES_MOCK.filter((item) => !item.lida).length;
    expect(await NotificacoesService.contarNaoLidas()).toBe(naoLidas);
  });

  it('getNotificacoes retorna lista vazia no cenário de lista vazia', async () => {
    await MockScenarioService.setCenario(CENARIOS.VAZIO);
    expect(await NotificacoesService.getNotificacoes()).toEqual([]);
  });

  it('getNotificacoes falha no cenário de erro', async () => {
    await MockScenarioService.setCenario(CENARIOS.ERRO);
    await expect(NotificacoesService.getNotificacoes()).rejects.toThrow();
  });

  it('contarNaoLidas não quebra o dashboard no cenário de erro', async () => {
    await MockScenarioService.setCenario(CENARIOS.ERRO);
    await expect(NotificacoesService.contarNaoLidas()).resolves.toEqual(expect.any(Number));
  });
});
