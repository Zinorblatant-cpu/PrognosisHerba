import AsyncStorage from '@react-native-async-storage/async-storage';
import { NOTIFICACOES_MOCK } from '../mocks/notificacoesMock';
import MockScenarioService from './MockScenarioService';

const NOTIFICACOES_KEY = '@prognosisherba:notificacoes';

// O mock é a fonte da lista; o storage guarda apenas quais ids já foram lidos.
async function lerIdsLidos() {
  const data = await AsyncStorage.getItem(NOTIFICACOES_KEY);
  if (data) return JSON.parse(data);

  const iniciais = NOTIFICACOES_MOCK.filter((item) => item.lida).map((item) => item.id);
  await AsyncStorage.setItem(NOTIFICACOES_KEY, JSON.stringify(iniciais));
  return iniciais;
}

async function montarLista() {
  const lidos = await lerIdsLidos();
  return NOTIFICACOES_MOCK.map((item) => ({ ...item, lida: lidos.includes(item.id) }));
}

const NotificacoesService = {
  async getNotificacoes() {
    const lista = await montarLista();
    return MockScenarioService.aplicar(lista, { vazio: [] });
  },

  // Usado pelo badge do Dashboard. Não passa pelos cenários de mock de
  // propósito: o contador do cabeçalho não deve derrubar a tela inicial.
  async contarNaoLidas() {
    try {
      const lista = await montarLista();
      return lista.filter((item) => !item.lida).length;
    } catch (e) {
      return 0;
    }
  },

  async marcarComoLida(id) {
    const lidos = await lerIdsLidos();
    if (!lidos.includes(id)) {
      await AsyncStorage.setItem(NOTIFICACOES_KEY, JSON.stringify([...lidos, id]));
    }
    return montarLista();
  },

  async marcarTodasComoLidas() {
    const todos = NOTIFICACOES_MOCK.map((item) => item.id);
    await MockScenarioService.aplicarEscrita(todos);
    await AsyncStorage.setItem(NOTIFICACOES_KEY, JSON.stringify(todos));
    return montarLista();
  },

  async resetarLeituras() {
    await AsyncStorage.removeItem(NOTIFICACOES_KEY);
  },
};

export default NotificacoesService;
