// Cenários de simulação da camada de mock (Sprint 3).
//
// Enquanto não existe integração com a API real, todos os services passam suas
// respostas por aqui. Isso permite exercitar, em tempo de execução, os quatro
// estados que a interface precisa saber tratar:
//
//   sucesso → dados completos (comportamento padrão do app)
//   vazio   → a API respondeu, mas não há registros (listas vazias)
//   erro    → a API falhou (timeout / indisponibilidade) → tela de erro + "Tentar novamente"
//   lento   → resposta demorada → estados de carregamento ficam visíveis
//
// O cenário ativo é escolhido pelo usuário em Perfil → "Modo de demonstração"
// e fica persistido em AsyncStorage (ver MockScenarioService).

export const CENARIOS = {
  SUCESSO: 'sucesso',
  VAZIO: 'vazio',
  ERRO: 'erro',
  LENTO: 'lento',
};

export const CENARIO_PADRAO = CENARIOS.SUCESSO;

export const CENARIOS_INFO = [
  {
    id: CENARIOS.SUCESSO,
    emoji: '✅',
    titulo: 'Dados completos',
    descricao: 'Comportamento normal: trechos, agenda e notificações preenchidos.',
  },
  {
    id: CENARIOS.VAZIO,
    emoji: '📭',
    titulo: 'Listas vazias',
    descricao: 'A API responde sem registros. Exibe os estados de lista vazia.',
  },
  {
    id: CENARIOS.ERRO,
    emoji: '⚠️',
    titulo: 'Erro de conexão',
    descricao: 'A API falha. Exibe a tela de erro com a ação "Tentar novamente".',
  },
  {
    id: CENARIOS.LENTO,
    emoji: '🐢',
    titulo: 'Resposta lenta',
    descricao: 'Atraso de 2,5s em cada chamada para evidenciar o carregamento.',
  },
];

export const ATRASO_CENARIO_LENTO_MS = 2500;

export const MENSAGEM_ERRO_PADRAO =
  'Não foi possível conectar ao servidor da Motiva. Verifique sua conexão e tente novamente.';

// Erro de "API" simulada. As telas tratam qualquer rejeição, mas esta classe
// deixa explícito que a falha veio da camada de mock e não de um bug.
export class MockApiError extends Error {
  constructor(message = MENSAGEM_ERRO_PADRAO) {
    super(message);
    this.name = 'MockApiError';
    this.isMockApiError = true;
  }
}
