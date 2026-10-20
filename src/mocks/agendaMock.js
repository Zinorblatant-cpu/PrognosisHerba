// Agenda operacional do podador.
//
// Sprint 4: a escala deixou de ter datas fixas. A semana é montada a partir do
// relógio do aparelho (segunda a sexta do dia operacional), então "hoje" na
// agenda e no Dashboard sempre acompanha o calendário real.

import {
  hoje as hojeReal,
  toISODate,
  nomeDiaSemana,
  formatarDiaMes,
  formatarDiaExtenso,
  formatarIntervalo,
  getDiaOperacional,
  getSemanaOperacional,
  ehFimDeSemana,
} from '../utils/datas';

// Cards de "Atividades do Dia" no Dashboard. Cada card abre a RegistrarPodaScreen
// no modo indicado por `tipo` — nenhum card do dashboard fica sem destino.
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

// Serviço previsto para cada trecho quando ele entra na escala.
const SERVICO_POR_TRECHO = {
  'trecho-1': {
    trecho: 'Trecho Jundiaí - Acesso Norte',
    rodovia: 'Rodovia Anhanguera (SP-330)',
    descricao: 'Poda emergencial — vegetação cobrindo placa de sinalização no km 80.',
  },
  'trecho-2': {
    trecho: 'Trecho Várzea Paulista',
    rodovia: 'Rodovia dos Bandeirantes (SP-348)',
    descricao: 'Roçada preventiva no limite da faixa de domínio.',
  },
  'trecho-3': {
    trecho: 'Trecho Itu - Pista Marginal',
    rodovia: 'Rodovia Castello Branco (SP-280)',
    descricao: 'Poda de manutenção na faixa de domínio, conforme cronograma ARTESP.',
  },
  'trecho-4': {
    trecho: 'Trecho Cotia - Entroncamento',
    rodovia: 'Rodovia Raposo Tavares (SP-270)',
    descricao: 'Liberação de visibilidade na curva do km 35.',
  },
  'trecho-5': {
    trecho: 'Trecho Oeste - Barueri',
    rodovia: 'Rodoanel Mário Covas (SP-021)',
    descricao: 'Roçada de rotina e limpeza de dispositivos de drenagem.',
  },
};

// O trecho do dia é sempre o mais urgente (Jundiaí). Dias já passados usam
// trechos recém-podados; dias futuros, os que estão na fila de prioridade.
const TRECHO_DO_DIA = 'trecho-1';
const FILA_PASSADO = ['trecho-3', 'trecho-5', 'trecho-2', 'trecho-4'];
const FILA_FUTURO = ['trecho-4', 'trecho-2', 'trecho-5', 'trecho-3'];

export const EQUIPE_PADRAO = 'Equipe Alfa';

// Datas de referência da semana corrente, calculadas a partir de `base`.
export function getDataReferencia(base = hojeReal()) {
  const operacional = getDiaOperacional(base);
  const semana = getSemanaOperacional(base);
  const foraDoExpediente = ehFimDeSemana(base);

  return {
    hoje: toISODate(operacional),
    diaExtenso: foraDoExpediente
      ? 'Próxima diária: ' + formatarDiaExtenso(operacional)
      : formatarDiaExtenso(operacional),
    intervaloSemana: formatarIntervalo(semana[0], semana[4]),
    foraDoExpediente,
  };
}

// Escala de segunda a sexta. `status` cobre os estados de uma diária:
// executada, programada e ausência justificada (registrada antecipadamente).
export function montarAgendaSemana(base = hojeReal()) {
  const semana = getSemanaOperacional(base);
  const hojeISO = toISODate(getDiaOperacional(base));
  const indiceHoje = semana.findIndex((dia) => toISODate(dia) === hojeISO);
  // A ausência pré-aprovada cai dois dias úteis depois de hoje (nunca no
  // próprio dia), para não conflitar com a confirmação de poda do Dashboard.
  const indiceAusencia = (indiceHoje + 2) % 5;

  const passado = [...FILA_PASSADO];
  const futuro = [...FILA_FUTURO];

  return semana.map((data, indice) => {
    const iso = toISODate(data);
    const base = {
      id: iso,
      data: iso,
      diaSemana: nomeDiaSemana(data),
      diaLabel: formatarDiaMes(data),
      equipe: EQUIPE_PADRAO,
    };

    if (indice === indiceAusencia) {
      return {
        ...base,
        turno: '—',
        status: 'Ausência justificada',
        trechoId: null,
        trecho: 'Sem trecho alocado',
        rodovia: 'Consulta médica registrada pelo operador',
        descricao: 'Ausência informada pelo próprio operador no app, já aprovada pela supervisão.',
      };
    }

    let trechoId;
    let status;
    if (indice === indiceHoje) {
      trechoId = TRECHO_DO_DIA;
      status = 'Programada';
    } else if (indice < indiceHoje) {
      trechoId = passado.shift();
      status = 'Concluída';
    } else {
      trechoId = futuro.shift();
      status = 'Programada';
    }

    return {
      ...base,
      ...SERVICO_POR_TRECHO[trechoId],
      trechoId,
      status,
      turno: indice === 4 ? '09:00 - 13:00' : '09:00 - 17:00',
    };
  });
}

// Itens de "Atividades da Semana" no Dashboard, derivados da escala.
export function montarItensSemana(semana) {
  const diasDePoda = semana.filter((dia) => dia.trechoId).length;
  const trechos = new Set(semana.filter((dia) => dia.trechoId).map((dia) => dia.trechoId));

  return [
    { id: 'days', icon: '📅', label: 'Poda em quantos dias', value: diasDePoda + ' dias programados' },
    { id: 'local', icon: '📍', label: 'Local da poda', value: trechos.size + ' trechos definidos' },
    { id: 'hora', icon: '🕐', label: 'Hora da poda', value: '09:00h - 17:00h' },
  ];
}

// Números do "Resumo da semana". Strings porque são exibidos diretamente.
export function montarResumoSemana(semana) {
  const diasDePoda = semana.filter((dia) => dia.trechoId).length;
  const trechos = new Set(semana.filter((dia) => dia.trechoId).map((dia) => dia.trechoId));
  return {
    dias: String(diasDePoda),
    locais: String(trechos.size),
    horarioInicio: '09:00',
  };
}

export const AGENDA_STATUS_INFO = {
  Concluída: { emoji: '✅', color: '#1A3300' },
  Confirmada: { emoji: '✂️', color: '#1A3300' },
  Programada: { emoji: '🗓️', color: '#00294D' },
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
