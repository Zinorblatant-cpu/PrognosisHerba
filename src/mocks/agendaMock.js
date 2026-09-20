// Agenda operacional do podador. Semana de referência: 15 a 19 de junho de 2026,
// coerente com as datas de última inspeção usadas em trechosMock.js.

export const DATA_REFERENCIA = {
  hoje: '2026-06-16',
  diaExtenso: 'Terça-feira, 16 de junho',
  intervaloSemana: '15 a 19 de junho',
};

// Cards de "Atividades do Dia" no Dashboard. `rota`/`params` definem para onde
// cada card navega — nenhum card do dashboard fica sem destino.
export const ATIVIDADES_DIA = [
  {
    id: 'poda',
    icon: '✂️',
    cor: '#1A3300',
    label: 'Poda',
    sub: 'Confirme o trecho e o horário',
    tipo: 'poda',
  },
  {
    id: 'nao-poda',
    icon: '🚫',
    cor: '#330000',
    label: 'Não Poda',
    sub: 'Informe sua ausência',
    tipo: 'ausencia',
  },
];

// Itens de "Atividades da Semana" no Dashboard.
export const ITENS_SEMANA = [
  { id: 'days', icon: '📅', label: 'Poda em quantos dias', value: '3 dias programados' },
  { id: 'local', icon: '📍', label: 'Local da poda', value: '3 trechos definidos' },
  { id: 'hora', icon: '🕐', label: 'Hora da poda', value: '09:00h - 17:00h' },
];

// Números do "Resumo da semana". Mantidos como string porque são exibidos
// diretamente, sem formatação adicional.
export const RESUMO_SEMANA = {
  dias: '3',
  locais: '5',
  horarioInicio: '09:00',
};

// Calendário da semana usado pela tela Agenda. `status` cobre os três estados
// de uma diária: já executada, programada e ausência justificada.
export const AGENDA_SEMANA = [
  {
    id: '2026-06-15',
    data: '2026-06-15',
    diaSemana: 'Segunda-feira',
    diaLabel: '15 de junho',
    turno: '09:00 - 17:00',
    equipe: 'Equipe Alfa',
    status: 'Concluída',
    trechoId: 'trecho-3',
    trecho: 'Trecho Itu - Pista Marginal',
    rodovia: 'Rodovia Castello Branco (SP-280)',
    descricao: 'Poda de manutenção na faixa de domínio, conforme cronograma ARTESP.',
  },
  {
    id: '2026-06-16',
    data: '2026-06-16',
    diaSemana: 'Terça-feira',
    diaLabel: '16 de junho',
    turno: '09:00 - 17:00',
    equipe: 'Equipe Alfa',
    status: 'Programada',
    trechoId: 'trecho-1',
    trecho: 'Trecho Jundiaí - Acesso Norte',
    rodovia: 'Rodovia Anhanguera (SP-330)',
    descricao: 'Poda emergencial — vegetação cobrindo placa de sinalização no km 80.',
  },
  {
    id: '2026-06-17',
    data: '2026-06-17',
    diaSemana: 'Quarta-feira',
    diaLabel: '17 de junho',
    turno: '09:00 - 17:00',
    equipe: 'Equipe Alfa',
    status: 'Programada',
    trechoId: 'trecho-4',
    trecho: 'Trecho Cotia - Entroncamento',
    rodovia: 'Rodovia Raposo Tavares (SP-270)',
    descricao: 'Liberação de visibilidade na curva do km 35.',
  },
  {
    id: '2026-06-18',
    data: '2026-06-18',
    diaSemana: 'Quinta-feira',
    diaLabel: '18 de junho',
    turno: '—',
    equipe: 'Equipe Alfa',
    status: 'Ausência justificada',
    trechoId: null,
    trecho: 'Sem trecho alocado',
    rodovia: 'Consulta médica registrada pelo operador',
    descricao: 'Ausência informada pelo próprio operador no app, já aprovada pela supervisão.',
  },
  {
    id: '2026-06-19',
    data: '2026-06-19',
    diaSemana: 'Sexta-feira',
    diaLabel: '19 de junho',
    turno: '09:00 - 13:00',
    equipe: 'Equipe Alfa',
    status: 'Programada',
    trechoId: 'trecho-2',
    trecho: 'Trecho Várzea Paulista',
    rodovia: 'Rodovia dos Bandeirantes (SP-348)',
    descricao: 'Roçada preventiva no limite da faixa de domínio.',
  },
];

export const AGENDA_STATUS_INFO = {
  'Concluída': { emoji: '✅', color: '#1A3300' },
  'Confirmada': { emoji: '✂️', color: '#1A3300' },
  'Programada': { emoji: '🗓️', color: '#00294D' },
  'Ausência justificada': { emoji: '🚫', color: '#330000' },
};

// Horários que o operador pode escolher ao confirmar a poda do dia.
export const TURNOS_DISPONIVEIS = [
  { id: 'manha', label: 'Manhã', horario: '07:00 - 12:00' },
  { id: 'integral', label: 'Integral', horario: '09:00 - 17:00' },
  { id: 'tarde', label: 'Tarde', horario: '13:00 - 18:00' },
];

// Motivos pré-definidos para o fluxo alternativo "Não Poda".
export const MOTIVOS_AUSENCIA = [
  { id: 'chuva', label: 'Condições climáticas', descricao: 'Chuva ou pista molhada impedem a operação.' },
  { id: 'equipamento', label: 'Falha de equipamento', descricao: 'Roçadeira ou EPI indisponível.' },
  { id: 'saude', label: 'Atestado / saúde', descricao: 'Afastamento médico do operador.' },
  { id: 'interdicao', label: 'Trecho interditado', descricao: 'Obra ou acidente bloqueando o acesso.' },
  { id: 'outro', label: 'Outro motivo', descricao: 'Descreva a justificativa no campo abaixo.' },
];
