import AsyncStorage from '@react-native-async-storage/async-storage';
import { TRECHOS_MOCK } from '../mocks/trechosMock';

const TRECHOS_KEY = '@prognosisherba:trechos';

const TrechosService = {
  async getTrechos() {
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

  async getTrechoById(id) {
    const trechos = await this.getTrechos();
    return trechos.find((trecho) => trecho.id === id) || null;
  },

  async registerInspecao(trechoId, { status, observacao, tecnico }) {
    const trechos = await this.getTrechos();
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

    await AsyncStorage.setItem(TRECHOS_KEY, JSON.stringify(trechosAtualizados));
    return trechosAtualizados.find((trecho) => trecho.id === trechoId);
  },

  async registerFeedback(trechoId, { podaRealizada, previsaoCorreta }) {
    const trechos = await this.getTrechos();
    const feedbackPodador = {
      podaRealizada,
      previsaoCorreta,
      dataFeedback: new Date().toISOString().slice(0, 10),
    };

    const trechosAtualizados = trechos.map((trecho) => {
      if (trecho.id !== trechoId) return trecho;
      return { ...trecho, feedbackPodador };
    });

    await AsyncStorage.setItem(TRECHOS_KEY, JSON.stringify(trechosAtualizados));
    return trechosAtualizados.find((trecho) => trecho.id === trechoId);
  },
};

export default TrechosService;
