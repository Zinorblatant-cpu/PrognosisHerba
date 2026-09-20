import AsyncStorage from '@react-native-async-storage/async-storage';
import AgendaService from '../src/services/AgendaService';
import MockScenarioService from '../src/services/MockScenarioService';
import { CENARIOS } from '../src/mocks/mockScenarios';
import { DATA_REFERENCIA } from '../src/mocks/agendaMock';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('AgendaService', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
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
