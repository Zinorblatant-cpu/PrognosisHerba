// Motor de previsão de necessidade de poda (Sprint 4).
//
// Até a Sprint 3 a "previsão de IA" era um campo fixo do mock. Agora ela é
// calculada no aparelho, a cada leitura, a partir dos dados do próprio trecho.
// É um modelo de pontuação explicável (0–100) — cada fator que soma ou
// subtrai pontos vira uma linha de justificativa na tela. Ele é o "baseline"
// que um modelo de machine learning treinado com os feedbacks dos podadores
// vai substituir quando houver backend (ver PLANO_DE_NEGOCIO.md).
//
// Fatores e pesos:
//   status da última inspeção ........ Crítico +60 | Atenção +35 | Conforme +10
//   dias desde a última inspeção ..... +1,0/dia no período chuvoso (out–mar)
//                                      +0,5/dia no período seco (abr–set)
//   tendência entre as 2 últimas ..... piorou +10 | melhorou −5
//   risco à segurança viária ......... +15 se a observação cita placa,
//                                      sinalização, visibilidade, curva…
//   poda recém-executada ............. −10 se a última inspeção é "Conforme"
//                                      e registra poda/roçada realizada
//
// Níveis: ≥ 70 Urgente · ≥ 40 Atenção · < 40 Não necessária

import { hoje as hojeReal, diasEntre, ehPeriodoChuvoso } from '../utils/datas';
import { getStatusInfo } from '../constants/statusVegetacao';

export const LIMIAR_URGENTE = 70;
export const LIMIAR_ATENCAO = 40;

export const PESO_STATUS = { Crítico: 60, Atenção: 35, Conforme: 10 };
export const TAXA_CRESCIMENTO = { chuvoso: 1.0, seco: 0.5 };
export const PESO_PIORA = 10;
export const PESO_MELHORA = -5;
export const PESO_RISCO_SEGURANCA = 15;
export const PESO_PODA_RECENTE = -10;

const PALAVRAS_RISCO = /placa|sinaliza|visibilidade|curva|pedestre|semáforo|semaforo|defensa/i;
const PALAVRAS_PODA = /poda realizada|roçada realizada|rocada realizada|podado|roçado/i;

function limitar(valor, min, max) {
  return Math.min(max, Math.max(min, valor));
}

function classificar(score) {
  if (score >= LIMIAR_URGENTE) return 'Urgente';
  if (score >= LIMIAR_ATENCAO) return 'Atenção';
  return 'Não necessária';
}

// Confiança cresce quanto mais longe o score está do limiar mais próximo
// (classificação "folgada") e quanto mais inspeções existem no histórico.
function calcularConfianca(score, totalInspecoes) {
  const distancia = Math.min(Math.abs(score - LIMIAR_URGENTE), Math.abs(score - LIMIAR_ATENCAO));
  const porMargem = Math.min(25, distancia * 1.5);
  const porHistorico = Math.min(15, totalInspecoes * 5);
  return Math.round(limitar(55 + porMargem + porHistorico, 50, 98));
}

const PrevisaoIAService = {
  calcular(trecho, base = hojeReal()) {
    const historico = trecho.historico || [];
    const ultima = historico[0];
    const anterior = historico[1];
    const status = trecho.statusVegetacao || ultima?.status || 'Conforme';
    const fatores = [];

    let score = PESO_STATUS[status] ?? PESO_STATUS['Conforme'];
    fatores.push({ descricao: 'Última inspeção classificou o trecho como ' + status, pontos: score });

    const dataUltima = trecho.ultimaInspecao || ultima?.data;
    if (dataUltima) {
      const dias = Math.max(0, diasEntre(dataUltima, base));
      const chuvoso = ehPeriodoChuvoso(base);
      const taxa = chuvoso ? TAXA_CRESCIMENTO.chuvoso : TAXA_CRESCIMENTO.seco;
      const pontos = Math.round(dias * taxa * 10) / 10;
      score += pontos;
      fatores.push({
        descricao:
          dias +
          (dias === 1 ? ' dia' : ' dias') +
          ' sem inspeção, em período ' +
          (chuvoso ? 'chuvoso (crescimento acelerado)' : 'seco (crescimento lento)'),
        pontos,
      });
    }

    if (ultima && anterior) {
      const atual = getStatusInfo(ultima.status).gravidade;
      const antes = getStatusInfo(anterior.status).gravidade;
      if (atual > antes) {
        score += PESO_PIORA;
        fatores.push({ descricao: 'Situação piorou entre as duas últimas inspeções', pontos: PESO_PIORA });
      } else if (atual < antes) {
        score += PESO_MELHORA;
        fatores.push({
          descricao: 'Situação melhorou entre as duas últimas inspeções',
          pontos: PESO_MELHORA,
        });
      }
    }

    const observacao = ultima?.observacao || '';
    if (PALAVRAS_RISCO.test(observacao)) {
      score += PESO_RISCO_SEGURANCA;
      fatores.push({
        descricao: 'Risco à segurança viária relatado (sinalização ou visibilidade)',
        pontos: PESO_RISCO_SEGURANCA,
      });
    }
    if (status === 'Conforme' && PALAVRAS_PODA.test(observacao)) {
      score += PESO_PODA_RECENTE;
      fatores.push({ descricao: 'Poda executada na última inspeção', pontos: PESO_PODA_RECENTE });
    }

    score = Math.round(limitar(score, 0, 100));
    const nivel = classificar(score);

    return {
      nivel,
      score,
      confianca: calcularConfianca(score, historico.length),
      motivo: montarMotivo(nivel, fatores),
      fatores,
      calculadaEm: base instanceof Date ? base.toISOString() : String(base),
    };
  },

  aplicar(trechos, base = hojeReal()) {
    return trechos.map((trecho) => ({ ...trecho, previsaoIA: this.calcular(trecho, base) }));
  },
};

function montarMotivo(nivel, fatores) {
  // Urgente/Atenção: os dois fatores que mais somaram. Não necessária: o
  // status atual e o que puxou a pontuação para baixo.
  const selecionados =
    nivel === 'Não necessária'
      ? [fatores[0], ...fatores.filter((f) => f.pontos < 0)]
      : [...fatores]
          .filter((f) => f.pontos > 0)
          .sort((a, b) => b.pontos - a.pontos)
          .slice(0, 2);
  const principais = selecionados
    .filter(Boolean)
    .map((f) => f.descricao.charAt(0).toLowerCase() + f.descricao.slice(1));

  const prefixo = {
    Urgente: 'Poda urgente recomendada: ',
    Atenção: 'Programar poda em breve: ',
    'Não necessária': 'Poda não necessária agora: ',
  }[nivel];

  return prefixo + (principais.length ? principais.join('; ') + '.' : 'sem fatores de risco relevantes.');
}

export default PrevisaoIAService;
