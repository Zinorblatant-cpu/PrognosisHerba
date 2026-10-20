import TrechosService from './TrechosService';
import MockScenarioService from './MockScenarioService';
import { gerarFeedbacksHistoricos } from '../mocks/feedbackIAMock';

const NIVEIS = ['Urgente', 'Atenção', 'Não necessária'];

function taxa(acertos, total) {
  return total === 0 ? null : Math.round((acertos / total) * 100);
}

// Consolida os feedbacks dos podadores (histórico + os registrados no app)
// em indicadores de acerto do modelo — fecha o ciclo de avaliação da IA que
// ficou pendente na Sprint 3 (P6).
export function consolidar(trechos, historicos) {
  const doApp = trechos
    .filter(
      (trecho) => trecho.feedbackPodador?.dataFeedback && trecho.feedbackPodador.previsaoCorreta !== null,
    )
    .map((trecho) => ({
      id: 'fb-app-' + trecho.id,
      trechoId: trecho.id,
      data: trecho.feedbackPodador.dataFeedback,
      nivelPrevisto: trecho.feedbackPodador.nivelPrevisto || trecho.previsaoIA?.nivel || null,
      previsaoCorreta: trecho.feedbackPodador.previsaoCorreta,
      podaRealizada: trecho.feedbackPodador.podaRealizada,
      tecnico: 'Você',
      registradoNoApp: true,
    }));

  const feedbacks = [...doApp, ...historicos].sort((a, b) => (a.data < b.data ? 1 : -1));
  const acertos = feedbacks.filter((f) => f.previsaoCorreta).length;

  const porNivel = NIVEIS.map((nivel) => {
    const doNivel = feedbacks.filter((f) => f.nivelPrevisto === nivel);
    const acertosNivel = doNivel.filter((f) => f.previsaoCorreta).length;
    return { nivel, total: doNivel.length, acertos: acertosNivel, taxa: taxa(acertosNivel, doNivel.length) };
  });

  const porTrecho = trechos.map((trecho) => {
    const doTrecho = feedbacks.filter((f) => f.trechoId === trecho.id);
    const acertosTrecho = doTrecho.filter((f) => f.previsaoCorreta).length;
    return {
      trechoId: trecho.id,
      nomeTrecho: trecho.nomeTrecho,
      rodovia: trecho.rodovia,
      nivelAtual: trecho.previsaoIA?.nivel || null,
      total: doTrecho.length,
      acertos: acertosTrecho,
      taxa: taxa(acertosTrecho, doTrecho.length),
      ultimo: doTrecho[0] || null,
    };
  });

  return {
    total: feedbacks.length,
    acertos,
    erros: feedbacks.length - acertos,
    taxaAcerto: taxa(acertos, feedbacks.length),
    registradosNoApp: doApp.length,
    porNivel,
    porTrecho,
    recentes: feedbacks.slice(0, 5),
  };
}

const DesempenhoIAService = {
  async getResumo() {
    const trechos = await TrechosService.lerTrechos();
    const resumo = consolidar(trechos, gerarFeedbacksHistoricos());
    return MockScenarioService.aplicar(resumo, { vazio: consolidar([], []) });
  },
};

export default DesempenhoIAService;
