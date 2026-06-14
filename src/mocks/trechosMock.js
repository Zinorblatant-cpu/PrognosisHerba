// Mock de trechos das rodovias concedidas à Motiva (SP), com status de
// vegetação e histórico de inspeções, usado para simular a API real.
export const TRECHOS_MOCK = [
  {
    id: 'trecho-1',
    rodovia: 'Rodovia Anhanguera (SP-330)',
    km: 'km 78 a km 83',
    nomeTrecho: 'Trecho Jundiaí - Acesso Norte',
    latitude: -23.1857,
    longitude: -46.8979,
    statusVegetacao: 'Crítico',
    ultimaInspecao: '2026-06-02',
    previsaoIA: {
      nivel: 'Urgente',
      confianca: 94,
      motivo: 'Vegetação alta cobrindo placa de sinalização e crescimento acelerado próximo ao acostamento — risco para sinalização e segurança viária.',
    },
    feedbackPodador: {
      podaRealizada: null,
      previsaoCorreta: null,
      dataFeedback: null,
    },
    historico: [
      {
        data: '2026-06-02',
        status: 'Crítico',
        observacao: 'Vegetação alta cobrindo placa de sinalização km 80.',
        tecnico: 'João Silva',
      },
      {
        data: '2026-05-20',
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
    ultimaInspecao: '2026-05-28',
    previsaoIA: {
      nivel: 'Atenção',
      confianca: 81,
      motivo: 'Vegetação se aproximando do limite da faixa de domínio, com tendência de avanço sobre o acostamento.',
    },
    feedbackPodador: {
      podaRealizada: null,
      previsaoCorreta: null,
      dataFeedback: null,
    },
    historico: [
      {
        data: '2026-05-28',
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
    ultimaInspecao: '2026-06-08',
    previsaoIA: {
      nivel: 'Não necessária',
      confianca: 90,
      motivo: 'Poda realizada recentemente e sem sinais de crescimento acelerado desde a última inspeção.',
    },
    feedbackPodador: {
      podaRealizada: null,
      previsaoCorreta: null,
      dataFeedback: null,
    },
    historico: [
      {
        data: '2026-06-08',
        status: 'Conforme',
        observacao: 'Poda realizada conforme cronograma. Sem pendências.',
        tecnico: 'João Silva',
      },
      {
        data: '2026-05-15',
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
    ultimaInspecao: '2026-06-05',
    previsaoIA: {
      nivel: 'Urgente',
      confianca: 97,
      motivo: 'Vegetação obstruindo a visibilidade na curva km 35, com risco direto à segurança dos usuários da via.',
    },
    feedbackPodador: {
      podaRealizada: null,
      previsaoCorreta: null,
      dataFeedback: null,
    },
    historico: [
      {
        data: '2026-06-05',
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
    ultimaInspecao: '2026-06-10',
    previsaoIA: {
      nivel: 'Não necessária',
      confianca: 88,
      motivo: 'Trecho dentro dos padrões ARTESP/ANTT, sem indícios de crescimento que comprometa a faixa de domínio.',
    },
    feedbackPodador: {
      podaRealizada: null,
      previsaoCorreta: null,
      dataFeedback: null,
    },
    historico: [
      {
        data: '2026-06-10',
        status: 'Conforme',
        observacao: 'Trecho dentro dos padrões ARTESP/ANTT.',
        tecnico: 'João Silva',
      },
    ],
  },
];
