// Notificações operacionais recebidas pelo podador. Cada item aponta para o
// trecho de origem (`trechoId`), permitindo abrir o detalhe direto da notificação.
//
// Sprint 4: horários relativos ao dia atual (antes eram fixos em 16/06/2026)
// e textos alinhados ao motor de previsão — o nível citado é o que o app calcula.
import { hoje, addDias, toISODate } from '../utils/datas';
import { getDataReferencia } from './agendaMock';

export const NOTIFICACAO_IDS = ['notif-1', 'notif-2', 'notif-3', 'notif-4', 'notif-5'];

export function gerarNotificacoesMock(base = hoje()) {
  const dia = (n) => toISODate(addDias(base, -n));
  const referencia = getDataReferencia(base);
  const lembretePoda = referencia.foraDoExpediente
    ? 'Sua próxima poda é na ' +
      referencia.diaExtenso.replace('Próxima diária: ', '').toLowerCase() +
      ', das 09:00 às 17:00, na Rodovia Anhanguera (SP-330).'
    : 'Você tem poda programada hoje das 09:00 às 17:00 na Rodovia Anhanguera (SP-330).';

  return [
    {
      id: 'notif-1',
      tipo: 'alerta',
      titulo: 'Trecho crítico identificado',
      mensagem:
        'O trecho Jundiaí - Acesso Norte (SP-330, km 78 a 83) foi classificado como Crítico na última inspeção.',
      data: dia(0) + ' 07:12',
      lida: false,
      trechoId: 'trecho-1',
    },
    {
      id: 'notif-2',
      tipo: 'ia',
      titulo: 'Nova previsão de IA disponível',
      mensagem:
        'O modelo recalculou o trecho Cotia - Entroncamento como Urgente: vegetação obstruindo a visibilidade na curva do km 35.',
      data: dia(0) + ' 06:40',
      lida: false,
      trechoId: 'trecho-4',
    },
    {
      id: 'notif-3',
      tipo: 'agenda',
      titulo: referencia.foraDoExpediente ? 'Próxima poda programada' : 'Poda programada para hoje',
      mensagem: lembretePoda,
      data: dia(0) + ' 06:00',
      lida: false,
      trechoId: 'trecho-1',
    },
    {
      id: 'notif-4',
      tipo: 'sistema',
      titulo: 'Feedback registrado com sucesso',
      mensagem:
        'Seu retorno sobre a previsão de IA do trecho Itu - Pista Marginal foi enviado para a supervisão.',
      data: dia(1) + ' 17:34',
      lida: true,
      trechoId: 'trecho-3',
    },
    {
      id: 'notif-5',
      tipo: 'agenda',
      titulo: 'Escala da semana publicada',
      mensagem:
        'A escala de ' + referencia.intervaloSemana + ' da Equipe Alfa já está disponível na sua agenda.',
      data: dia(2) + ' 18:05',
      lida: true,
      trechoId: null,
    },
  ];
}

export const NOTIFICACAO_TIPO_INFO = {
  alerta: { emoji: '🔴', label: 'Alerta', color: '#330000' },
  ia: { emoji: '🤖', label: 'Previsão de IA', color: '#332B00' },
  agenda: { emoji: '🗓️', label: 'Agenda', color: '#00294D' },
  sistema: { emoji: '⚙️', label: 'Sistema', color: '#1A3300' },
};
