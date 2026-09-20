import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AgendaScreen from '../src/screens/AgendaScreen';
import AgendaService from '../src/services/AgendaService';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('../src/services/AgendaService');

const SEMANA = [
  {
    id: '2026-06-16',
    data: '2026-06-16',
    diaSemana: 'Terça-feira',
    diaLabel: '16 de junho',
    turno: '09:00 - 17:00',
    equipe: 'Equipe Alfa',
    status: 'Programada',
    trechoId: 'trecho-1',
    trecho: 'Trecho Jundiaí - Acesso Norte',
    rodovia: 'Rodovia Anhanguera (SP-330)',
    descricao: 'Poda emergencial no km 80.',
  },
  {
    id: '2026-06-18',
    data: '2026-06-18',
    diaSemana: 'Quinta-feira',
    diaLabel: '18 de junho',
    turno: '—',
    equipe: 'Equipe Alfa',
    status: 'Ausência justificada',
    trechoId: null,
    trecho: 'Sem trecho alocado',
    rodovia: 'Consulta médica registrada pelo operador',
    descricao: 'Ausência informada pelo operador.',
  },
];

describe('AgendaScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockGoBack.mockClear();
    AgendaService.getAgendaSemana.mockResolvedValue(SEMANA);
  });

  it('exibe o estado de carregamento antes da resposta', async () => {
    const { getByTestId, findByText } = render(<AgendaScreen />);
    expect(getByTestId('agenda-loading')).toBeTruthy();
    await findByText('Terça-feira');
  });

  it('lista os dias da escala com o status de cada um', async () => {
    const { findByText, findByTestId } = render(<AgendaScreen />);

    expect(await findByText('Terça-feira')).toBeTruthy();
    expect(await findByText('Quinta-feira')).toBeTruthy();

    const status = await findByTestId('agenda-status-2026-06-18');
    expect(status.props.children).toContain('Ausência justificada');
  });

  it('destaca o dia de hoje', async () => {
    const { findByText } = render(<AgendaScreen />);
    expect(await findByText('HOJE')).toBeTruthy();
  });

  it('abre o detalhe do trecho a partir de um dia da escala', async () => {
    const { findByTestId, findByText } = render(<AgendaScreen />);
    await findByText('Terça-feira');
    fireEvent.press(await findByTestId('agenda-abrir-2026-06-16'));

    expect(mockNavigate).toHaveBeenCalledWith('TrechoDetail', { trechoId: 'trecho-1' });
  });

  it('não oferece atalho de trecho em um dia de ausência', async () => {
    const { findByText, queryByTestId } = render(<AgendaScreen />);
    await findByText('Quinta-feira');

    expect(queryByTestId('agenda-abrir-2026-06-18')).toBeNull();
  });

  it('exibe o estado de lista vazia quando não há escala publicada', async () => {
    AgendaService.getAgendaSemana.mockResolvedValue([]);
    const { findByTestId } = render(<AgendaScreen />);
    expect(await findByTestId('agenda-vazio')).toBeTruthy();
  });

  it('exibe o estado de erro com ação de tentar novamente', async () => {
    AgendaService.getAgendaSemana.mockRejectedValue(new Error('Servidor indisponível.'));
    const { findByTestId, findByText } = render(<AgendaScreen />);

    expect(await findByTestId('agenda-erro')).toBeTruthy();
    expect(await findByText('Servidor indisponível.')).toBeTruthy();
  });

  it('recarrega a escala ao tocar em tentar novamente', async () => {
    AgendaService.getAgendaSemana.mockRejectedValueOnce(new Error('Servidor indisponível.'));
    const { findByTestId, findByText } = render(<AgendaScreen />);

    fireEvent.press(await findByTestId('agenda-erro-action'));
    expect(await findByText('Terça-feira')).toBeTruthy();
  });
});
