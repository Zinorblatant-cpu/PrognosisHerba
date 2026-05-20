import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from '../src/screens/LoginScreen';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('LoginScreen', () => {
  beforeEach(async () => {
    mockNavigate.mockClear();
    await AsyncStorage.clear();
  });

  it('renders title LOGIN', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('LOGIN')).toBeTruthy();
  });

  it('renders email input with correct placeholder', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    expect(getByPlaceholderText('COLOQUE SEU EMAIL')).toBeTruthy();
  });

  it('renders password input with correct placeholder', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    expect(getByPlaceholderText('COLOQUE SUA SENHA')).toBeTruthy();
  });

  it('renders login button', () => {
    const { getByTestId } = render(<LoginScreen />);
    expect(getByTestId('login-button')).toBeTruthy();
  });

  it('login button has label LOGAR', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('LOGAR')).toBeTruthy();
  });

  it('shows error when email is empty on submit', async () => {
    const { getByTestId, getByText } = render(<LoginScreen />);
    fireEvent.press(getByTestId('login-button'));
    await waitFor(() => {
      expect(getByText('Email é obrigatório')).toBeTruthy();
    });
  });

  it('shows error when email is invalid on submit', async () => {
    const { getByPlaceholderText, getByTestId, getByText } = render(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText('COLOQUE SEU EMAIL'), 'invalido');
    fireEvent.press(getByTestId('login-button'));
    await waitFor(() => {
      expect(getByText('Email inválido')).toBeTruthy();
    });
  });

  it('shows error when password is empty on submit', async () => {
    const { getByPlaceholderText, getByTestId, getByText } = render(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText('COLOQUE SEU EMAIL'), 'teste@email.com');
    fireEvent.press(getByTestId('login-button'));
    await waitFor(() => {
      expect(getByText('Senha é obrigatória')).toBeTruthy();
    });
  });

  it('navigates to Dashboard on successful login', async () => {
    const { getByPlaceholderText, getByTestId } = render(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText('COLOQUE SEU EMAIL'), 'joao@motiva.com');
    fireEvent.changeText(getByPlaceholderText('COLOQUE SUA SENHA'), 'senha123');
    fireEvent.press(getByTestId('login-button'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('Dashboard');
    });
  });

  it('saves user to AsyncStorage on successful login', async () => {
    const { getByPlaceholderText, getByTestId } = render(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText('COLOQUE SEU EMAIL'), 'joao@motiva.com');
    fireEvent.changeText(getByPlaceholderText('COLOQUE SUA SENHA'), 'senha123');
    fireEvent.press(getByTestId('login-button'));
    await waitFor(async () => {
      const stored = await AsyncStorage.getItem('@prognosisherba:user');
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored).email).toBe('joao@motiva.com');
    });
  });

  it('password input is secure text entry', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    expect(getByPlaceholderText('COLOQUE SUA SENHA').props.secureTextEntry).toBe(true);
  });

  it('email input uses email keyboard type', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    expect(getByPlaceholderText('COLOQUE SEU EMAIL').props.keyboardType).toBe('email-address');
  });
});
