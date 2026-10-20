import AsyncStorage from '@react-native-async-storage/async-storage';
import { gerarTrechosMock } from '../mocks/trechosMock';
import { hoje, toISODate } from '../utils/datas';
import MockScenarioService from './MockScenarioService';
import PrevisaoIAService from './PrevisaoIAService';

const TRECHOS_KEY = '@prognosisherba:trechos';
const VERSAO_KEY = '@prognosisherba:versaoDados';

// Sobe quando o formato dos dados semeados muda. Instalações que ainda têm os
// dados da Sprint 3 (datas fixas de junho) são re-semeadas automaticamente.
export const VERSAO_DADOS = '4';

async function semear() {
  const trechos = gerarTrechosMock();
  await AsyncStorage.setItem(TRECHOS_KEY, JSON.stringify(trechos));
  await AsyncStorage.setItem(VERSAO_KEY, VERSAO_DADOS);
  return trechos;
}

// A previsão nunca é persistida: é recalculada a cada leitura, para refletir
// o dia atual e a inspeção mais recente.
function comPrevisao(trechos) {
  return PrevisaoIAService.aplicar(trechos, hoje());
}

function semPrevisao({ previsaoIA, ...trecho }) {
  return trecho;
}

const TrechosService = {
  // Leitura crua do storage, sem passar pelos cenários de mock. Usada
  // internamente para que uma operação não aplique o cenário duas vezes.
  async lerTrechos() {
    const [data, versao] = await Promise.all([
      AsyncStorage.getItem(TRECHOS_KEY),
      AsyncStorage.getItem(VERSAO_KEY),
    ]);

    if (!data || versao !== VERSAO_DADOS) {
      return comPrevisao(await semear());
    }

    const trechos = JSON.parse(data).map((trecho) => ({
      ...semPrevisao(trecho),
      feedbackPodador: trecho.feedbackPodador ?? {
        podaRealizada: null,
        previsaoCorreta: null,
        dataFeedback: null,
      },
      historico: trecho.historico || [],
    }));
    return comPrevisao(trechos);
  },

  async gravar(trechos) {
    await AsyncStorage.setItem(TRECHOS_KEY, JSON.stringify(trechos.map(semPrevisao)));
    await AsyncStorage.setItem(VERSAO_KEY, VERSAO_DADOS);
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

  async registerInspecao(trechoId, { status, observacao, tecnico, foto = null }) {
    const trechos = await this.lerTrechos();
    const novaEntrada = {
      data: toISODate(hoje()),
      status,
      observacao,
      tecnico,
      ...(foto ? { foto } : {}),
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

    const atualizado = comPrevisao(trechosAtualizados).find((trecho) => trecho.id === trechoId);
    // O cenário de erro é aplicado antes de persistir: se a "API" falha,
    // nada é gravado — igual ao que aconteceria com um backend real.
    await MockScenarioService.aplicarEscrita(atualizado);
    await this.gravar(trechosAtualizados);
    return atualizado;
  },

  async registerFeedback(trechoId, { podaRealizada, previsaoCorreta }) {
    const trechos = await this.lerTrechos();
    const alvo = trechos.find((trecho) => trecho.id === trechoId);
    const feedbackPodador = {
      podaRealizada,
      previsaoCorreta,
      dataFeedback: toISODate(hoje()),
      // Guarda o nível que o modelo previa no momento do feedback — é o que
      // a tela "Desempenho da IA" compara com a resposta do podador.
      nivelPrevisto: alvo?.previsaoIA?.nivel ?? null,
    };

    const trechosAtualizados = trechos.map((trecho) => {
      if (trecho.id !== trechoId) return trecho;
      return { ...trecho, feedbackPodador };
    });

    const atualizado = comPrevisao(trechosAtualizados).find((trecho) => trecho.id === trechoId);
    await MockScenarioService.aplicarEscrita(atualizado);
    await this.gravar(trechosAtualizados);
    return atualizado;
  },

  // Restaura os trechos para o estado original do mock (Perfil → Modo de
  // demonstração), permitindo repetir a demonstração do zero.
  async resetarDados() {
    return comPrevisao(await semear());
  },
};

export default TrechosService;
