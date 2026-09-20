// Status de vegetação de um trecho, compartilhado entre a lista de trechos,
// o detalhe do trecho e o registro de inspeção — fonte única de verdade para
// emoji, cor de fundo do selo e ordem de gravidade.
export const STATUS_VEGETACAO_INFO = {
  'Conforme': { emoji: '🟢', color: '#1A3300', gravidade: 1 },
  'Atenção': { emoji: '🟡', color: '#332B00', gravidade: 2 },
  'Crítico': { emoji: '🔴', color: '#330000', gravidade: 3 },
};

export const STATUS_VEGETACAO_OPTIONS = [
  { key: 'conforme', value: 'Conforme', emoji: '🟢' },
  { key: 'atencao', value: 'Atenção', emoji: '🟡' },
  { key: 'critico', value: 'Crítico', emoji: '🔴' },
];

export function getStatusInfo(status) {
  return STATUS_VEGETACAO_INFO[status] || STATUS_VEGETACAO_INFO['Conforme'];
}
