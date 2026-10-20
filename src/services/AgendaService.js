import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ATIVIDADES_DIA,
  TURNOS_DISPONIVEIS,
  MOTIVOS_AUSENCIA,
  getDataReferencia,
  montarAgendaSemana,
  montarItensSemana,
  montarResumoSemana,
} from '../mocks/agendaMock';
import { toISODateTime, Relogio } from '../utils/datas';
import MockScenarioService from './MockScenarioService';

const AGENDA_KEY = '@prognosisherba:agenda';

// Registros feitos pelo operador (confirmação de poda / ausência), indexados
// por data. Sobrepõem o status vindo do mock da escala.
async function lerRegistros() {
  const data = await AsyncStorage.getItem(AGENDA_KEY);
  return data ? JSON.parse(data) : {};
}

async function gravarRegistros(registros) {
  await AsyncStorage.setItem(AGENDA_KEY, JSON.stringify(registros));
}

function aplicarRegistro(dia, registro) {
  if (!registro) return dia;

  if (registro.tipo === 'poda') {
    return {
      ...dia,
      status: 'Confirmada',
      turno: registro.turnoHorario || dia.turno,
      descricao: registro.observacao
        ? `${dia.descricao} — Observação do operador: ${registro.observacao}`
        : dia.descricao,
      registradoEm: registro.registradoEm,
    };
  }

  return {
    ...dia,
    status: 'Ausência justificada',
    turno: '—',
    descricao: `${registro.motivoLabel}${registro.justificativa ? ` — ${registro.justificativa}` : ''}`,
    registradoEm: registro.registradoEm,
  };
}

function agoraFormatado() {
  return toISODateTime(Relogio.agora());
}

const AgendaService = {
  // Datas da semana corrente — recalculadas a cada chamada para acompanhar
  // o relógio do aparelho (o app pode ficar aberto de um dia para o outro).
  getDataReferencia() {
    return getDataReferencia();
  },

  getAtividadesDia() {
    return ATIVIDADES_DIA;
  },

  getItensSemana() {
    return montarItensSemana(montarAgendaSemana());
  },

  getResumoSemana() {
    return montarResumoSemana(montarAgendaSemana());
  },

  getTurnos() {
    return TURNOS_DISPONIVEIS;
  },

  getMotivosAusencia() {
    return MOTIVOS_AUSENCIA;
  },

  async getAgendaSemana() {
    const registros = await lerRegistros();
    const semana = montarAgendaSemana().map((dia) => aplicarRegistro(dia, registros[dia.data]));
    return MockScenarioService.aplicar(semana, { vazio: [] });
  },

  async getRegistroDoDia(data = getDataReferencia().hoje) {
    const registros = await lerRegistros();
    return registros[data] || null;
  },

  async confirmarPoda({ data = getDataReferencia().hoje, turnoId, observacao = '' }) {
    const turno = TURNOS_DISPONIVEIS.find((item) => item.id === turnoId);
    const registro = {
      tipo: 'poda',
      data,
      turnoId,
      turnoLabel: turno?.label || '',
      turnoHorario: turno?.horario || '',
      observacao: observacao.trim(),
      registradoEm: agoraFormatado(),
    };

    await MockScenarioService.aplicarEscrita(registro);
    const registros = await lerRegistros();
    await gravarRegistros({ ...registros, [data]: registro });
    return registro;
  },

  async registrarAusencia({ data = getDataReferencia().hoje, motivoId, justificativa = '' }) {
    const motivo = MOTIVOS_AUSENCIA.find((item) => item.id === motivoId);
    const registro = {
      tipo: 'ausencia',
      data,
      motivoId,
      motivoLabel: motivo?.label || 'Motivo não informado',
      justificativa: justificativa.trim(),
      registradoEm: agoraFormatado(),
    };

    await MockScenarioService.aplicarEscrita(registro);
    const registros = await lerRegistros();
    await gravarRegistros({ ...registros, [data]: registro });
    return registro;
  },

  async limparRegistros() {
    await AsyncStorage.removeItem(AGENDA_KEY);
  },
};

export default AgendaService;
