import AsyncStorage from '@react-native-async-storage/async-storage';
import AgendaService from '../src/services/AgendaService';
import MockScenarioService from '../src/services/MockScenarioService';
import { CENARIOS } from '../src/mocks/mockScenarios';
import { Relogio } from '../src/utils/datas';

const AGORA = new Date(2026, 5, 16, 10, 0); // terça-feira
const DATA_REFERENCIA = { hoje: '2026-06-16' };

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('AgendaService', () => {
  beforeEach(async () => {
    jest.spyOn(Relogio, 'agora').mockReturnValue(AGORA);
    await AsyncStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('getDataReferencia acompanha o relógio do aparelho', () => {
    expect(AgendaService.getDataReferencia()).toMatchObject({
      hoje: '2026-06-16',
      diaExtenso: 'Terça-feira, 16 de junho',
      intervaloSemana: '15 a 19 de junho',
      foraDoExpediente: false,
    });
  });

  it('no fim de semana o dia operacional passa a ser a segunda seguinte', () => {
    Relogio.agora.mockReturnValue(new Date(2026, 9, 18, 20, 0)); // domingo
    expect(AgendaService.getDataReferencia()).toMatchObject({
      hoje: '2026-10-19',
      diaExtenso: 'Próxima diária: Segunda-feira, 19 de outubro',
      intervaloSemana: '19 a 23 de outubro',
      foraDoExpediente: true,
    });
  });

  it('a semana que cruza dois meses é exibida com os dois meses', () => {
    Relogio.agora.mockReturnValue(new Date(2026, 8, 30, 9, 0)); // quarta, 30/09
    expect(AgendaService.getDataReferencia().intervaloSemana).toBe('28 de setembro a 2 de outubro');
  });

  it('o dia de hoje fica Programado, os anteriores Concluídos e a ausência nunca cai hoje', async () => {
    const semana = await AgendaService.getAgendaSemana();
    const status = semana.map((dia) => dia.status);
    expect(status).toEqual(['Concluída', 'Programada', 'Programada', 'Ausência justificada', 'Programada']);
    expect(semana[1].trechoId).toBe('trecho-1');
  });

  it('registros usam a data local, não UTC (22h no Brasil continua sendo o mesmo dia)', async () => {
    Relogio.agora.mockReturnValue(new Date(2026, 5, 16, 22, 30));
    const registro = await AgendaService.confirmarPoda({ turnoId: 'manha' });
    expect(registro.registradoEm).toBe('2026-06-16 22:30');
  });

  it('getAgendaSemana retorna os cinco dias da escala', async () => {
    const semana = await AgendaService.getAgendaSemana();
    expect(semana.length).toBe(5);
    expect(semana[0]).toMatchObject({ diaSemana: 'Segunda-feira' });
  });

  it('getRegistroDoDia retorna null quando o operador ainda não registrou nada', async () => {
    expect(await AgendaService.getRegistroDoDia()).toBeNull();
  });

  it('confirmarPoda grava o turno escolhido para o dia', async () => {
    const registro = await AgendaService.confirmarPoda({
      turnoId: 'manha',
      observacao: 'Equipe completa.',
    });

    expect(registro).toMatchObject({
      tipo: 'poda',
      turnoId: 'manha',
      turnoHorario: '07:00 - 12:00',
      observacao: 'Equipe completa.',
    });
    expect(await AgendaService.getRegistroDoDia()).toMatchObject({ tipo: 'poda' });
  });

  it('a confirmação de poda muda o status do dia na agenda', async () => {
    await AgendaService.confirmarPoda({ turnoId: 'tarde' });

    const semana = await AgendaService.getAgendaSemana();
    const hoje = semana.find((dia) => dia.data === DATA_REFERENCIA.hoje);

    expect(hoje.status).toBe('Confirmada');
    expect(hoje.turno).toBe('13:00 - 18:00');
  });

  it('registrarAusencia grava o motivo e muda o status do dia', async () => {
    await AgendaService.registrarAusencia({ motivoId: 'chuva', justificativa: 'Pista molhada.' });

    const semana = await AgendaService.getAgendaSemana();
    const hoje = semana.find((dia) => dia.data === DATA_REFERENCIA.hoje);

    expect(hoje.status).toBe('Ausência justificada');
    expect(hoje.descricao).toContain('Condições climáticas');
    expect(hoje.descricao).toContain('Pista molhada.');
  });

  it('o registro mais recente do dia substitui o anterior', async () => {
    await AgendaService.confirmarPoda({ turnoId: 'integral' });
    await AgendaService.registrarAusencia({ motivoId: 'equipamento' });

    expect(await AgendaService.getRegistroDoDia()).toMatchObject({ tipo: 'ausencia' });
  });

  it('limparRegistros devolve a agenda ao estado original do mock', async () => {
    await AgendaService.registrarAusencia({ motivoId: 'saude' });
    await AgendaService.limparRegistros();

    const semana = await AgendaService.getAgendaSemana();
    const hoje = semana.find((dia) => dia.data === DATA_REFERENCIA.hoje);

    expect(hoje.status).toBe('Programada');
  });

  it('getAgendaSemana retorna lista vazia no cenário de lista vazia', async () => {
    await MockScenarioService.setCenario(CENARIOS.VAZIO);
    expect(await AgendaService.getAgendaSemana()).toEqual([]);
  });

  it('getAgendaSemana falha no cenário de erro', async () => {
    await MockScenarioService.setCenario(CENARIOS.ERRO);
    await expect(AgendaService.getAgendaSemana()).rejects.toThrow();
  });

  it('não grava a confirmação de poda quando a API falha', async () => {
    await MockScenarioService.setCenario(CENARIOS.ERRO);
    await expect(AgendaService.confirmarPoda({ turnoId: 'manha' })).rejects.toThrow();

    await MockScenarioService.setCenario(CENARIOS.SUCESSO);
    expect(await AgendaService.getRegistroDoDia()).toBeNull();
  });
});
