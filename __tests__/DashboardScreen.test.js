import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DashboardScreen from '../src/screens/DashboardScreen';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('DashboardScreen', () => {
  beforeEach(async () => {
    mockNavigate.mockClear();
    await AsyncStorage.clear();
  });

  it('renders user greeting with name', () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText(/Olá, João!/)).toBeTruthy();
  });

  it('renders subtitle confira suas atividades', () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText(/Confira suas atividades/)).toBeTruthy();
  });

  it('renders notification bell icon', () => {
    const { getByTestId } = render(<DashboardScreen />);
    expect(getByTestId('notification-bell')).toBeTruthy();
  });

  it('renders atividades do dia section title', () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText('Atividades do Dia')).toBeTruthy();
  });

  it('renders Poda activity card', () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText('Poda')).toBeTruthy();
  });

  it('renders Não Poda activity card', () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText('Não Poda')).toBeTruthy();
  });

  it('renders atividades da semana section title', () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText('Atividades da Semana')).toBeTruthy();
  });

  it('renders ver calendario link', () => {
    const { getByTestId } = render(<DashboardScreen />);
    expect(getByTestId('ver-calendario')).toBeTruthy();
  });

  it('renders poda days count item', () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText('Poda em quantos dias')).toBeTruthy();
  });

  it('renders local da poda item', () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText('Local da poda')).toBeTruthy();
  });

  it('renders hora da poda item', () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText('Hora da poda')).toBeTruthy();
  });

  it('renders resumo da semana section', () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText('Resumo da semana')).toBeTruthy();
  });

  it('renders dias de poda summary stat', () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText('Dias de poda')).toBeTruthy();
  });

  it('renders locais summary stat', () => {
    const { getAllByText } = render(<DashboardScreen />);
    expect(getAllByText('locais').length).toBeGreaterThan(0);
  });

  it('renders horario de inicio summary stat', () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText('horário de início')).toBeTruthy();
  });

  it('renders 3 dias de poda count', () => {
    const { getByTestId } = render(<DashboardScreen />);
    expect(getByTestId('stat-dias').props.children).toBe('3');
  });

  it('renders 5 locais count', () => {
    const { getByTestId } = render(<DashboardScreen />);
    expect(getByTestId('stat-locais').props.children).toBe('5');
  });

  it('renders 09:00 horario de inicio', () => {
    const { getByTestId } = render(<DashboardScreen />);
    expect(getByTestId('stat-horario').props.children).toBe('09:00');
  });

  it('renders logout button', () => {
    const { getByTestId } = render(<DashboardScreen />);
    expect(getByTestId('logout-button')).toBeTruthy();
  });

  it('clears AsyncStorage on logout', async () => {
    await AsyncStorage.setItem(
      '@prognosisherba:user',
      JSON.stringify({ email: 'joao@motiva.com' })
    );
    const { getByTestId } = render(<DashboardScreen />);
    fireEvent.press(getByTestId('logout-button'));
    await waitFor(async () => {
      const stored = await AsyncStorage.getItem('@prognosisherba:user');
      expect(stored).toBeNull();
    });
  });

  it('navigates to Register on logout', async () => {
    const { getByTestId } = render(<DashboardScreen />);
    fireEvent.press(getByTestId('logout-button'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('Register');
    });
  });
});
