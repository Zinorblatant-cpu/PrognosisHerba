// Operador de campo usado como usuário padrão do app enquanto não há backend.
// A conta de demonstração é a que permite entrar sem se cadastrar antes.
export const USUARIO_MOCK = {
  nome: 'João Silva',
  email: 'joao@motiva.com',
  cargo: 'Operador de Conservação Vegetal',
  matricula: 'MTV-4821',
  equipe: 'Equipe Alfa',
  regional: 'Regional Oeste — SP',
  telefone: '(11) 98432-1170',
  admissao: '2023-03-14',
};

export const CONTA_DEMO = {
  email: 'joao@motiva.com',
  senha: 'senha123',
};

export function getPrimeiroNome(nome) {
  return String(nome || '').trim().split(' ')[0] || 'Operador';
}
