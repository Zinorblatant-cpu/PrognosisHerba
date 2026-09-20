// Notificações operacionais recebidas pelo podador. Cada item aponta para o
// trecho de origem (`trechoId`), permitindo abrir o detalhe direto da notificação.
export const NOTIFICACOES_MOCK = [
  {
    id: 'notif-1',
    tipo: 'alerta',
    titulo: 'Trecho crítico identificado',
    mensagem:
      'O trecho Jundiaí - Acesso Norte (SP-330, km 78 a 83) foi classificado como Crítico na última inspeção.',
    data: '2026-06-16 07:12',
    lida: false,
    trechoId: 'trecho-1',
  },
  {
    id: 'notif-2',
    tipo: 'ia',
    titulo: 'Nova previsão de IA disponível',
    mensagem:
      'O modelo classificou o trecho Cotia - Entroncamento como Urgente, com 97% de confiança.',
    data: '2026-06-16 06:40',
    lida: false,
    trechoId: 'trecho-4',
  },
  {
    id: 'notif-3',
    tipo: 'agenda',
    titulo: 'Poda programada para hoje',
    mensagem: 'Você tem poda programada das 09:00 às 17:00 na Rodovia Anhanguera (SP-330).',
    data: '2026-06-16 06:00',
    lida: false,
    trechoId: 'trecho-1',
  },
  {
    id: 'notif-4',
    tipo: 'sistema',
    titulo: 'Feedback registrado com sucesso',
    mensagem:
      'Seu retorno sobre a previsão de IA do trecho Itu - Pista Marginal foi enviado para a supervisão.',
    data: '2026-06-15 17:34',
    lida: true,
    trechoId: 'trecho-3',
  },
  {
    id: 'notif-5',
    tipo: 'agenda',
    titulo: 'Escala da semana publicada',
    mensagem: 'A escala de 15 a 19 de junho da Equipe Alfa já está disponível na sua agenda.',
    data: '2026-06-14 18:05',
    lida: true,
    trechoId: null,
  },
];

export const NOTIFICACAO_TIPO_INFO = {
  alerta: { emoji: '🔴', label: 'Alerta', color: '#330000' },
  ia: { emoji: '🤖', label: 'Previsão de IA', color: '#332B00' },
  agenda: { emoji: '🗓️', label: 'Agenda', color: '#00294D' },
  sistema: { emoji: '⚙️', label: 'Sistema', color: '#1A3300' },
};
