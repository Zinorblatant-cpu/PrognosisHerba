import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ATIVIDADES_DIA,
  ITENS_SEMANA,
  RESUMO_SEMANA,
  AGENDA_SEMANA,
  DATA_REFERENCIA,
  TURNOS_DISPONIVEIS,
  MOTIVOS_AUSENCIA,
} from '../mocks/agendaMock';
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

const AgendaService = {
  getDataReferencia() {
    return DATA_REFERENCIA;
  },

  getAtividadesDia() {
    return ATIVIDADES_DIA;
  },

  getItensSemana() {
    return ITENS_SEMANA;
  },

  getResumoSemana() {
    return RESUMO_SEMANA;
  },

  getTurnos() {
    return TURNOS_DISPONIVEIS;
  },

  getMotivosAusencia() {
    return MOTIVOS_AUSENCIA;
  },

  async getAgendaSemana() {
    const registros = await lerRegistros();
    const semana = AGENDA_SEMANA.map((dia) => aplicarRegistro(dia, registros[dia.data]));
    return MockScenarioService.aplicar(semana, { vazio: [] });
  },

  async getRegistroDoDia(data = DATA_REFERENCIA.hoje) {
    const registros = await lerRegistros();
    return registros[data] || null;
  },

  async confirmarPoda({ data = DATA_REFERENCIA.hoje, turnoId, observacao = '' }) {
    const turno = TURNOS_DISPONIVEIS.find((item) => item.id === turnoId);
    const registro = {
      tipo: 'poda',
      data,
      turnoId,
      turnoLabel: turno?.label || '',
      turnoHorario: turno?.horario || '',
      observacao: observacao.trim(),
      registradoEm: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };

    await MockScenarioService.aplicarEscrita(registro);
    const registros = await lerRegistros();
    await gravarRegistros({ ...registros, [data]: registro });
    return registro;
  },

  async registrarAusencia({ data = DATA_REFERENCIA.hoje, motivoId, justificativa = '' }) {
    const motivo = MOTIVOS_AUSENCIA.find((item) => item.id === motivoId);
    const registro = {
      tipo: 'ausencia',
      data,
      motivoId,
      motivoLabel: motivo?.label || 'Motivo não informado',
      justificativa: justificativa.trim(),
      registradoEm: new Date().toISOString().slice(0, 16).replace('T', ' '),
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
