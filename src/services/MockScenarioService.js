import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CENARIOS,
  CENARIO_PADRAO,
  ATRASO_CENARIO_LENTO_MS,
  MockApiError,
} from '../mocks/mockScenarios';

const CENARIO_KEY = '@prognosisherba:cenarioMock';

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MockScenarioService = {
  async getCenario() {
    try {
      const armazenado = await AsyncStorage.getItem(CENARIO_KEY);
      return Object.values(CENARIOS).includes(armazenado) ? armazenado : CENARIO_PADRAO;
    } catch (e) {
      return CENARIO_PADRAO;
    }
  },

  async setCenario(cenario) {
    const valido = Object.values(CENARIOS).includes(cenario) ? cenario : CENARIO_PADRAO;
    await AsyncStorage.setItem(CENARIO_KEY, valido);
    return valido;
  },

  // Passa a resposta de um service pelo cenário ativo. `vazio` é o que a tela
  // deve receber quando a "API" responde sem registros.
  async aplicar(dados, { vazio = [] } = {}) {
    const cenario = await this.getCenario();

    if (cenario === CENARIOS.ERRO) {
      throw new MockApiError();
    }
    if (cenario === CENARIOS.LENTO) {
      await delay(ATRASO_CENARIO_LENTO_MS);
    }
    if (cenario === CENARIOS.VAZIO) {
      return vazio;
    }
    return dados;
  },

  // Versão para operações de escrita: o cenário de erro também derruba o save,
  // mas o cenário "vazio" não faz sentido aqui e é tratado como sucesso.
  async aplicarEscrita(dados) {
    const cenario = await this.getCenario();

    if (cenario === CENARIOS.ERRO) {
      throw new MockApiError('Não foi possível salvar. Tente novamente em instantes.');
    }
    if (cenario === CENARIOS.LENTO) {
      await delay(ATRASO_CENARIO_LENTO_MS);
    }
    return dados;
  },
};

export default MockScenarioService;
