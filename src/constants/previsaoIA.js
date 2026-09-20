// Classificações da previsão de IA para necessidade de poda.
// "prioridade" é usada para ordenar os trechos do mais urgente para o menos urgente.
export const PREVISAO_IA_INFO = {
  'Urgente': { emoji: '🔴', color: '#330000', prioridade: 3 },
  'Atenção': { emoji: '🟡', color: '#332B00', prioridade: 2 },
  'Não necessária': { emoji: '🟢', color: '#1A3300', prioridade: 1 },
};

export function getPrioridadeIA(nivel) {
  return PREVISAO_IA_INFO[nivel]?.prioridade ?? 0;
}
