import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import NotificacoesScreen from '../src/screens/NotificacoesScreen';
import NotificacoesService from '../src/services/NotificacoesService';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('../src/services/NotificacoesService');

const NOTIFICACOES = [
  {
    id: 'notif-1',
    tipo: 'alerta',
    titulo: 'Trecho crítico identificado',
    mensagem: 'O trecho Jundiaí foi classificado como Crítico.',
    data: '2026-06-16 07:12',
    lida: false,
    trechoId: 'trecho-1',
  },
  {
    id: 'notif-5',
    tipo: 'agenda',
    titulo: 'Escala da semana publicada',
    mensagem: 'A escala de 15 a 19 de junho já está disponível.',
    data: '2026-06-14 18:05',
    lida: true,
    trechoId: null,
  },
];

describe('NotificacoesScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockGoBack.mockClear();
    NotificacoesService.getNotificacoes.mockResolvedValue(NOTIFICACOES);
    NotificacoesService.marcarComoLida.mockResolvedValue(
      NOTIFICACOES.map((item) => ({ ...item, lida: true }))
    );
    NotificacoesService.marcarTodasComoLidas.mockResolvedValue(
      NOTIFICACOES.map((item) => ({ ...item, lida: true }))
    );
  });

  it('exibe o estado de carregamento antes da resposta', async () => {
    const { getByTestId, findByText } = render(<NotificacoesScreen />);
    expect(getByTestId('notificacoes-loading')).toBeTruthy();
    await findByText('Trecho crítico identificado');
  });

  it('lista as notificações retornadas pelo serviço', async () => {
    const { findByText } = render(<NotificacoesScreen />);
    expect(await findByText('Trecho crítico identificado')).toBeTruthy();
    expect(await findByText('Escala da semana publicada')).toBeTruthy();
  });

  it('marca visualmente as notificações não lidas', async () => {
    const { findByTestId, queryByTestId } = render(<NotificacoesScreen />);
    expect(await findByTestId('nao-lida-notif-1')).toBeTruthy();
    expect(queryByTestId('nao-lida-notif-5')).toBeNull();
  });

  it('exibe o estado de lista vazia quando não há notificações', async () => {
    NotificacoesService.getNotificacoes.mockResolvedValue([]);
    const { findByTestId } = render(<NotificacoesScreen />);
    expect(await findByTestId('notificacoes-vazio')).toBeTruthy();
  });

  it('exibe o estado de erro com ação de tentar novamente', async () => {
    NotificacoesService.getNotificacoes.mockRejectedValue(new Error('Falha de conexão simulada'));
    const { findByTestId, findByText } = render(<NotificacoesScreen />);

    expect(await findByTestId('notificacoes-erro')).toBeTruthy();
    expect(await findByText('Falha de conexão simulada')).toBeTruthy();
    expect(await findByTestId('notificacoes-erro-action')).toBeTruthy();
  });

  it('recarrega a lista ao tocar em tentar novamente', async () => {
    NotificacoesService.getNotificacoes.mockRejectedValueOnce(new Error('Falha de conexão simulada'));
    const { findByTestId, findByText } = render(<NotificacoesScreen />);

    fireEvent.press(await findByTestId('notificacoes-erro-action'));

    expect(await findByText('Trecho crítico identificado')).toBeTruthy();
  });

  it('abre o trecho relacionado ao tocar em uma notificação', async () => {
    const { findByTestId } = render(<NotificacoesScreen />);
    fireEvent.press(await findByTestId('notificacao-notif-1'));

    await waitFor(() => {
      expect(NotificacoesService.marcarComoLida).toHaveBeenCalledWith('notif-1');
      expect(mockNavigate).toHaveBeenCalledWith('TrechoDetail', { trechoId: 'trecho-1' });
    });
  });

  it('não navega quando a notificação não tem trecho associado', async () => {
    const { findByTestId } = render(<NotificacoesScreen />);
    fireEvent.press(await findByTestId('notificacao-notif-5'));

    await waitFor(() => {
      expect(NotificacoesService.marcarComoLida).toHaveBeenCalledWith('notif-5');
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('marca todas como lidas e confirma na tela', async () => {
    const { findByTestId, findByText } = render(<NotificacoesScreen />);
    fireEvent.press(await findByTestId('marcar-todas-button'));

    await waitFor(() => {
      expect(NotificacoesService.marcarTodasComoLidas).toHaveBeenCalled();
    });
    expect(await findByText(/marcadas como lidas/)).toBeTruthy();
  });
});
