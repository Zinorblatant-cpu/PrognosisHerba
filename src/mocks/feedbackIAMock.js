// Histórico de feedbacks dos podadores sobre previsões anteriores do modelo
// (semanas passadas). Serve de base para a tela "Desempenho da IA" já abrir
// com dados; cada feedback novo registrado no app soma a esta lista.
//
// Datas relativas ao dia em que o app é aberto, como nos demais mocks.
import { hoje, addDias, toISODate } from '../utils/datas';

const BASE = [
  {
    trechoId: 'trecho-1',
    diasAtras: 41,
    nivelPrevisto: 'Atenção',
    previsaoCorreta: true,
    tecnico: 'João Silva',
  },
  {
    trechoId: 'trecho-2',
    diasAtras: 38,
    nivelPrevisto: 'Não necessária',
    previsaoCorreta: false,
    tecnico: 'Marcos Lima',
  },
  {
    trechoId: 'trecho-3',
    diasAtras: 36,
    nivelPrevisto: 'Urgente',
    previsaoCorreta: true,
    tecnico: 'João Silva',
  },
  {
    trechoId: 'trecho-4',
    diasAtras: 33,
    nivelPrevisto: 'Atenção',
    previsaoCorreta: true,
    tecnico: 'Ana Costa',
  },
  {
    trechoId: 'trecho-5',
    diasAtras: 30,
    nivelPrevisto: 'Não necessária',
    previsaoCorreta: true,
    tecnico: 'Marcos Lima',
  },
  {
    trechoId: 'trecho-1',
    diasAtras: 27,
    nivelPrevisto: 'Atenção',
    previsaoCorreta: true,
    tecnico: 'João Silva',
  },
  {
    trechoId: 'trecho-2',
    diasAtras: 24,
    nivelPrevisto: 'Atenção',
    previsaoCorreta: true,
    tecnico: 'Ana Costa',
  },
  {
    trechoId: 'trecho-3',
    diasAtras: 22,
    nivelPrevisto: 'Atenção',
    previsaoCorreta: false,
    tecnico: 'João Silva',
  },
  {
    trechoId: 'trecho-4',
    diasAtras: 19,
    nivelPrevisto: 'Urgente',
    previsaoCorreta: true,
    tecnico: 'Ana Costa',
  },
  {
    trechoId: 'trecho-5',
    diasAtras: 15,
    nivelPrevisto: 'Atenção',
    previsaoCorreta: false,
    tecnico: 'Marcos Lima',
  },
  {
    trechoId: 'trecho-3',
    diasAtras: 9,
    nivelPrevisto: 'Urgente',
    previsaoCorreta: true,
    tecnico: 'João Silva',
  },
  {
    trechoId: 'trecho-5',
    diasAtras: 7,
    nivelPrevisto: 'Não necessária',
    previsaoCorreta: true,
    tecnico: 'Marcos Lima',
  },
];

export function gerarFeedbacksHistoricos(base = hoje()) {
  return BASE.map((item, indice) => ({
    id: 'fb-hist-' + (indice + 1),
    trechoId: item.trechoId,
    data: toISODate(addDias(base, -item.diasAtras)),
    nivelPrevisto: item.nivelPrevisto,
    previsaoCorreta: item.previsaoCorreta,
    podaRealizada: true,
    tecnico: item.tecnico,
  }));
}
