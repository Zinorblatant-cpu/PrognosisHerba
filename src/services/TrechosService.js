import AsyncStorage from '@react-native-async-storage/async-storage';
import { TRECHOS_MOCK } from '../mocks/trechosMock';
import MockScenarioService from './MockScenarioService';

const TRECHOS_KEY = '@prognosisherba:trechos';

const TrechosService = {
  // Leitura crua do storage, sem passar pelos cenários de mock. Usada
  // internamente para que uma operação não aplique o cenário duas vezes.
  async lerTrechos() {
    const data = await AsyncStorage.getItem(TRECHOS_KEY);
    if (data) {
      const trechos = JSON.parse(data);
      const trechosAtualizados = trechos.map((trecho) => {
        const mock = TRECHOS_MOCK.find((item) => item.id === trecho.id);
        return {
          ...trecho,
          previsaoIA: trecho.previsaoIA ?? mock?.previsaoIA,
          feedbackPodador: trecho.feedbackPodador ?? mock?.feedbackPodador,
        };
      });

      if (JSON.stringify(trechosAtualizados) !== data) {
        await AsyncStorage.setItem(TRECHOS_KEY, JSON.stringify(trechosAtualizados));
      }
      return trechosAtualizados;
    }
    await AsyncStorage.setItem(TRECHOS_KEY, JSON.stringify(TRECHOS_MOCK));
    return TRECHOS_MOCK;
  },

  async getTrechos() {
    const trechos = await this.lerTrechos();
    return MockScenarioService.aplicar(trechos, { vazio: [] });
  },

  async getTrechoById(id) {
    const trechos = await this.lerTrechos();
    const trecho = trechos.find((item) => item.id === id) || null;
    return MockScenarioService.aplicar(trecho, { vazio: trecho });
  },

  async registerInspecao(trechoId, { status, observacao, tecnico }) {
    const trechos = await this.lerTrechos();
    const novaEntrada = {
      data: new Date().toISOString().slice(0, 10),
      status,
      observacao,
      tecnico,
    };

    const trechosAtualizados = trechos.map((trecho) => {
      if (trecho.id !== trechoId) return trecho;
      return {
        ...trecho,
        statusVegetacao: status,
        ultimaInspecao: novaEntrada.data,
        historico: [novaEntrada, ...trecho.historico],
      };
    });

    const atualizado = trechosAtualizados.find((trecho) => trecho.id === trechoId);
    // O cenário de erro é aplicado antes de persistir: se a "API" falha,
    // nada é gravado — igual ao que aconteceria com um backend real.
    await MockScenarioService.aplicarEscrita(atualizado);
    await AsyncStorage.setItem(TRECHOS_KEY, JSON.stringify(trechosAtualizados));
    return atualizado;
  },

  async registerFeedback(trechoId, { podaRealizada, previsaoCorreta }) {
    const trechos = await this.lerTrechos();
    const feedbackPodador = {
      podaRealizada,
      previsaoCorreta,
      dataFeedback: new Date().toISOString().slice(0, 10),
    };

    const trechosAtualizados = trechos.map((trecho) => {
      if (trecho.id !== trechoId) return trecho;
      return { ...trecho, feedbackPodador };
    });

    const atualizado = trechosAtualizados.find((trecho) => trecho.id === trechoId);
    await MockScenarioService.aplicarEscrita(atualizado);
    await AsyncStorage.setItem(TRECHOS_KEY, JSON.stringify(trechosAtualizados));
    return atualizado;
  },

  // Restaura os trechos para o estado original do mock (Perfil → Modo de
  // demonstração), permitindo repetir a demonstração do zero.
  async resetarDados() {
    await AsyncStorage.setItem(TRECHOS_KEY, JSON.stringify(TRECHOS_MOCK));
    return TRECHOS_MOCK;
  },
};

export default TrechosService;
