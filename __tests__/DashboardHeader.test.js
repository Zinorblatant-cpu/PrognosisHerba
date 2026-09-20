import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import DashboardScreen from '../src/screens/DashboardScreen';
import NotificacoesService from '../src/services/NotificacoesService';
import AgendaService from '../src/services/AgendaService';
import AuthService from '../src/services/AuthService';

const mockNavigate = jest.fn();
const mockReset = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, reset: mockReset }),
  useFocusEffect: (callback) => require('react').useEffect(callback, []),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('../src/services/NotificacoesService');
jest.mock('../src/services/AgendaService');
jest.mock('../src/services/AuthService');

const ATIVIDADES = [
  { id: 'poda', icon: '✂️', cor: '#1A3300', label: 'Poda', sub: 'Confirme o trecho', tipo: 'poda' },
  { id: 'nao-poda', icon: '🚫', cor: '#330000', label: 'Não Poda', sub: 'Informe sua ausência', tipo: 'ausencia' },
];

describe('DashboardScreen — cabeçalho e navegação (Sprint 3)', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockReset.mockClear();

    AgendaService.getAtividadesDia.mockReturnValue(ATIVIDADES);
    AgendaService.getItensSemana.mockReturnValue([
      { id: 'days', icon: '📅', label: 'Poda em quantos dias', value: '3 dias programados' },
    ]);
    AgendaService.getResumoSemana.mockReturnValue({ dias: '3', locais: '5', horarioInicio: '09:00' });
    AgendaService.getRegistroDoDia.mockResolvedValue(null);

    NotificacoesService.contarNaoLidas.mockResolvedValue(3);
    AuthService.getPerfil.mockResolvedValue({ nome: 'Maria Souza' });
    AuthService.clearUser.mockResolvedValue();
  });

  it('exibe o badge com o número de notificações não lidas', async () => {
    const { findByTestId } = render(<DashboardScreen />);
    const badge = await findByTestId('notification-badge');
    expect(badge).toBeTruthy();
  });

  it('não exibe o badge quando não há notificações não lidas', async () => {
    NotificacoesService.contarNaoLidas.mockResolvedValue(0);
    const { queryByTestId, findByText } = render(<DashboardScreen />);
    await findByText('Resumo da semana');
    expect(queryByTestId('notification-badge')).toBeNull();
  });

  it('atualiza a saudação com o nome do usuário logado', async () => {
    const { findByText } = render(<DashboardScreen />);
    expect(await findByText(/Olá, Maria!/)).toBeTruthy();
  });

  it('o sino abre a tela de notificações', async () => {
    const { findByTestId } = render(<DashboardScreen />);
    fireEvent.press(await findByTestId('notification-bell'));
    expect(mockNavigate).toHaveBeenCalledWith('Notificacoes');
  });

  it('o ícone de perfil abre a tela de perfil', async () => {
    const { findByTestId } = render(<DashboardScreen />);
    fireEvent.press(await findByTestId('perfil-button'));
    expect(mockNavigate).toHaveBeenCalledWith('Perfil');
  });

  it('o card Poda abre o registro de poda', async () => {
    const { findByTestId } = render(<DashboardScreen />);
    fireEvent.press(await findByTestId('atividade-poda'));
    expect(mockNavigate).toHaveBeenCalledWith('RegistrarPoda', { tipo: 'poda' });
  });

  it('o card Não Poda abre o registro de ausência', async () => {
    const { findByTestId } = render(<DashboardScreen />);
    fireEvent.press(await findByTestId('atividade-nao-poda'));
    expect(mockNavigate).toHaveBeenCalledWith('RegistrarPoda', { tipo: 'ausencia' });
  });

  it('o link Ver calendário abre a agenda', async () => {
    const { findByTestId } = render(<DashboardScreen />);
    fireEvent.press(await findByTestId('ver-calendario'));
    expect(mockNavigate).toHaveBeenCalledWith('Agenda');
  });

  it('os itens da semana abrem a agenda', async () => {
    const { findByTestId } = render(<DashboardScreen />);
    fireEvent.press(await findByTestId('semana-days'));
    expect(mockNavigate).toHaveBeenCalledWith('Agenda');
  });

  it('mostra no card do dia que a poda já foi confirmada', async () => {
    AgendaService.getRegistroDoDia.mockResolvedValue({
      tipo: 'poda',
      turnoHorario: '07:00 - 12:00',
    });

    const { findByText } = render(<DashboardScreen />);
    expect(await findByText(/Confirmada • 07:00 - 12:00/)).toBeTruthy();
  });

  it('mostra no card do dia que a ausência já foi registrada', async () => {
    AgendaService.getRegistroDoDia.mockResolvedValue({
      tipo: 'ausencia',
      motivoLabel: 'Condições climáticas',
    });

    const { findByText } = render(<DashboardScreen />);
    expect(await findByText(/Registrada • Condições climáticas/)).toBeTruthy();
  });
});
