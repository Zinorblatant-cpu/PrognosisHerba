import PrevisaoIAService, { LIMIAR_URGENTE, LIMIAR_ATENCAO } from '../src/services/PrevisaoIAService';
import { gerarTrechosMock } from '../src/mocks/trechosMock';

const JUNHO = new Date(2026, 5, 16); // período seco
const OUTUBRO = new Date(2026, 9, 19); // período chuvoso

function trecho(parcial) {
  return {
    id: 't',
    statusVegetacao: 'Conforme',
    ultimaInspecao: '2026-06-16',
    historico: [{ data: '2026-06-16', status: 'Conforme', observacao: 'Ok.' }],
    ...parcial,
  };
}

describe('PrevisaoIAService', () => {
  it('classifica os 5 trechos do mock como a supervisão espera', () => {
    const niveis = Object.fromEntries(
      PrevisaoIAService.aplicar(gerarTrechosMock(JUNHO), JUNHO).map((t) => [t.id, t.previsaoIA.nivel])
    );
    expect(niveis).toEqual({
      'trecho-1': 'Urgente',
      'trecho-2': 'Atenção',
      'trecho-3': 'Não necessária',
      'trecho-4': 'Urgente',
      'trecho-5': 'Não necessária',
    });
  });

  it('a mesma classificação se mantém no período chuvoso', () => {
    const niveis = PrevisaoIAService.aplicar(gerarTrechosMock(OUTUBRO), OUTUBRO).map((t) => t.previsaoIA.nivel);
    expect(niveis).toEqual(['Urgente', 'Atenção', 'Não necessária', 'Urgente', 'Não necessária']);
  });

  it('o tempo sem inspeção pesa o dobro no período chuvoso', () => {
    const base = trecho({ ultimaInspecao: '2026-05-17', historico: [] });
    const seco = PrevisaoIAService.calcular(base, JUNHO).score; // 30 dias × 0,5
    const chuvoso = PrevisaoIAService.calcular({ ...base, ultimaInspecao: '2026-09-19' }, OUTUBRO).score; // 30 × 1,0
    expect(chuvoso - seco).toBe(15);
  });

  it('no período chuvoso um trecho Conforme vira Atenção em 30 dias e Urgente em 60', () => {
    const t = trecho({ ultimaInspecao: '2026-10-01', historico: [] });
    expect(PrevisaoIAService.calcular(t, new Date(2026, 9, 10)).nivel).toBe('Não necessária');
    expect(PrevisaoIAService.calcular(t, new Date(2026, 9, 31)).nivel).toBe('Atenção'); // 30 dias
    expect(PrevisaoIAService.calcular(t, new Date(2026, 10, 30)).nivel).toBe('Urgente'); // 60 dias
  });

  it('no período seco o mesmo trecho leva o dobro do tempo para virar Atenção', () => {
    const t = trecho({ ultimaInspecao: '2026-06-01', historico: [] });
    expect(PrevisaoIAService.calcular(t, new Date(2026, 6, 1)).nivel).toBe('Não necessária'); // 30 dias
    expect(PrevisaoIAService.calcular(t, new Date(2026, 6, 31)).nivel).toBe('Atenção'); // 60 dias
  });

  it('risco à sinalização soma pontos e aparece entre os fatores', () => {
    const semRisco = PrevisaoIAService.calcular(
      trecho({ statusVegetacao: 'Atenção', historico: [{ status: 'Atenção', observacao: 'Mato alto.' }] }),
      JUNHO
    );
    const comRisco = PrevisaoIAService.calcular(
      trecho({ statusVegetacao: 'Atenção', historico: [{ status: 'Atenção', observacao: 'Cobrindo a placa.' }] }),
      JUNHO
    );
    expect(comRisco.score - semRisco.score).toBe(15);
    expect(comRisco.fatores.map((f) => f.descricao).join(' ')).toMatch(/segurança viária/);
  });

  it('piora entre inspeções aumenta a pontuação; melhora reduz', () => {
    const piorou = PrevisaoIAService.calcular(
      trecho({
        statusVegetacao: 'Atenção',
        historico: [
          { status: 'Atenção', observacao: '.' },
          { status: 'Conforme', observacao: '.' },
        ],
      }),
      JUNHO
    );
    const melhorou = PrevisaoIAService.calcular(
      trecho({
        statusVegetacao: 'Atenção',
        historico: [
          { status: 'Atenção', observacao: '.' },
          { status: 'Crítico', observacao: '.' },
        ],
      }),
      JUNHO
    );
    expect(piorou.score - melhorou.score).toBe(15);
  });

  it('a pontuação fica entre 0 e 100 e a confiança entre 50 e 98', () => {
    const extremo = PrevisaoIAService.calcular(
      trecho({ statusVegetacao: 'Crítico', ultimaInspecao: '2025-01-01', historico: [] }),
      OUTUBRO
    );
    expect(extremo.score).toBe(100);
    expect(extremo.confianca).toBeGreaterThanOrEqual(50);
    expect(extremo.confianca).toBeLessThanOrEqual(98);
  });

  it('o motivo é um texto legível começando pela recomendação', () => {
    const [t1] = PrevisaoIAService.aplicar(gerarTrechosMock(JUNHO), JUNHO);
    expect(t1.previsaoIA.motivo).toMatch(/^Poda urgente recomendada: /);
    expect(LIMIAR_URGENTE).toBeGreaterThan(LIMIAR_ATENCAO);
  });
});
