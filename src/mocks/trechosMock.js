// Mock de trechos das rodovias concedidas à Motiva (SP), com status de
// vegetação e histórico de inspeções, usado para simular a API real.
//
// Sprint 4:
// - as datas são relativas ao dia em que o app semeia os dados (antes eram
//   fixas em junho/2026), então o histórico sempre "conta" uma história atual;
// - `previsaoIA` saiu do mock: agora é calculada pelo PrevisaoIAService a partir
//   do status, do histórico e da época do ano (ver src/services/PrevisaoIAService.js).
import { hoje, addDias, toISODate } from '../utils/datas';

export function gerarTrechosMock(base = hoje()) {
  const diasAtras = (n) => toISODate(addDias(base, -n));

  return [
    {
      id: 'trecho-1',
      rodovia: 'Rodovia Anhanguera (SP-330)',
      km: 'km 78 a km 83',
      nomeTrecho: 'Trecho Jundiaí - Acesso Norte',
      latitude: -23.1857,
      longitude: -46.8979,
      statusVegetacao: 'Crítico',
      ultimaInspecao: diasAtras(14),
      feedbackPodador: {
        podaRealizada: null,
        previsaoCorreta: null,
        dataFeedback: null,
      },
      historico: [
        {
          data: diasAtras(14),
          status: 'Crítico',
          observacao: 'Vegetação alta cobrindo placa de sinalização km 80.',
          tecnico: 'João Silva',
        },
        {
          data: diasAtras(27),
          status: 'Atenção',
          observacao: 'Crescimento acelerado próximo ao acostamento.',
          tecnico: 'João Silva',
        },
      ],
    },
    {
      id: 'trecho-2',
      rodovia: 'Rodovia dos Bandeirantes (SP-348)',
      km: 'km 45 a km 50',
      nomeTrecho: 'Trecho Várzea Paulista',
      latitude: -23.2147,
      longitude: -46.8242,
      statusVegetacao: 'Atenção',
      ultimaInspecao: diasAtras(19),
      feedbackPodador: {
        podaRealizada: null,
        previsaoCorreta: null,
        dataFeedback: null,
      },
      historico: [
        {
          data: diasAtras(19),
          status: 'Atenção',
          observacao: 'Vegetação se aproximando do limite da faixa de domínio.',
          tecnico: 'João Silva',
        },
      ],
    },
    {
      id: 'trecho-3',
      rodovia: 'Rodovia Castello Branco (SP-280)',
      km: 'km 60 a km 65',
      nomeTrecho: 'Trecho Itu - Pista Marginal',
      latitude: -23.2639,
      longitude: -47.2997,
      statusVegetacao: 'Conforme',
      ultimaInspecao: diasAtras(8),
      feedbackPodador: {
        podaRealizada: null,
        previsaoCorreta: null,
        dataFeedback: null,
      },
      historico: [
        {
          data: diasAtras(8),
          status: 'Conforme',
          observacao: 'Poda realizada conforme cronograma. Sem pendências.',
          tecnico: 'João Silva',
        },
        {
          data: diasAtras(32),
          status: 'Atenção',
          observacao: 'Vegetação alta identificada na faixa lateral.',
          tecnico: 'João Silva',
        },
      ],
    },
    {
      id: 'trecho-4',
      rodovia: 'Rodovia Raposo Tavares (SP-270)',
      km: 'km 33 a km 38',
      nomeTrecho: 'Trecho Cotia - Entroncamento',
      latitude: -23.6019,
      longitude: -46.9189,
      statusVegetacao: 'Crítico',
      ultimaInspecao: diasAtras(11),
      feedbackPodador: {
        podaRealizada: null,
        previsaoCorreta: null,
        dataFeedback: null,
      },
      historico: [
        {
          data: diasAtras(11),
          status: 'Crítico',
          observacao: 'Vegetação obstruindo visibilidade na curva km 35.',
          tecnico: 'João Silva',
        },
      ],
    },
    {
      id: 'trecho-5',
      rodovia: 'Rodoanel Mário Covas (SP-021)',
      km: 'km 12 a km 17',
      nomeTrecho: 'Trecho Oeste - Barueri',
      latitude: -23.4858,
      longitude: -46.8761,
      statusVegetacao: 'Conforme',
      ultimaInspecao: diasAtras(6),
      feedbackPodador: {
        podaRealizada: null,
        previsaoCorreta: null,
        dataFeedback: null,
      },
      historico: [
        {
          data: diasAtras(6),
          status: 'Conforme',
          observacao: 'Trecho dentro dos padrões ARTESP/ANTT.',
          tecnico: 'João Silva',
        },
      ],
    },
  ];
}
