import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RegisterScreen from '../src/screens/RegisterScreen';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

describe('RegisterScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders logo and title', () => {
    const { getAllByText } = render(<RegisterScreen />);
    expect(getAllByText('REGISTRAR').length).toBeGreaterThanOrEqual(1);
  });

  it('renders email input', () => {
    const { getByPlaceholderText } = render(<RegisterScreen />);
    expect(getByPlaceholderText('COLOQUE SEU EMAIL')).toBeTruthy();
  });

  it('renders password input', () => {
    const { getByPlaceholderText } = render(<RegisterScreen />);
    expect(getByPlaceholderText('COLOQUE SUA SENHA')).toBeTruthy();
  });

  it('renders confirm password input', () => {
    const { getByPlaceholderText } = render(<RegisterScreen />);
    expect(getByPlaceholderText('CONFIRME SUA SENHA')).toBeTruthy();
  });

  it('renders register button', () => {
    const { getByTestId } = render(<RegisterScreen />);
    expect(getByTestId('register-button')).toBeTruthy();
  });

  it('shows error when email is empty on submit', async () => {
    const { getByTestId, getByText } = render(<RegisterScreen />);
    fireEvent.press(getByTestId('register-button'));
    await waitFor(() => {
      expect(getByText('Email é obrigatório')).toBeTruthy();
    });
  });

  it('shows error when email is invalid on submit', async () => {
    const { getByPlaceholderText, getByTestId, getByText } = render(<RegisterScreen />);
    fireEvent.changeText(getByPlaceholderText('COLOQUE SEU EMAIL'), 'invalido');
    fireEvent.press(getByTestId('register-button'));
    await waitFor(() => {
      expect(getByText('Email inválido')).toBeTruthy();
    });
  });

  it('shows error when password is empty on submit', async () => {
    const { getByPlaceholderText, getByTestId, getByText } = render(<RegisterScreen />);
    fireEvent.changeText(getByPlaceholderText('COLOQUE SEU EMAIL'), 'teste@email.com');
    fireEvent.press(getByTestId('register-button'));
    await waitFor(() => {
      expect(getByText('Senha é obrigatória')).toBeTruthy();
    });
  });

  it('shows error when passwords do not match', async () => {
    const { getByPlaceholderText, getByTestId, getByText } = render(<RegisterScreen />);
    fireEvent.changeText(getByPlaceholderText('COLOQUE SEU EMAIL'), 'teste@email.com');
    fireEvent.changeText(getByPlaceholderText('COLOQUE SUA SENHA'), 'senha123');
    fireEvent.changeText(getByPlaceholderText('CONFIRME SUA SENHA'), 'diferente123');
    fireEvent.press(getByTestId('register-button'));
    await waitFor(() => {
      expect(getByText('As senhas não coincidem')).toBeTruthy();
    });
  });

  it('navigates to Login screen on successful registration', async () => {
    const { getByPlaceholderText, getByTestId } = render(<RegisterScreen />);
    fireEvent.changeText(getByPlaceholderText('COLOQUE SEU EMAIL'), 'teste@email.com');
    fireEvent.changeText(getByPlaceholderText('COLOQUE SUA SENHA'), 'senha123');
    fireEvent.changeText(getByPlaceholderText('CONFIRME SUA SENHA'), 'senha123');
    fireEvent.press(getByTestId('register-button'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('Login');
    });
  });

  it('password input is secure text entry', () => {
    const { getByPlaceholderText } = render(<RegisterScreen />);
    expect(getByPlaceholderText('COLOQUE SUA SENHA').props.secureTextEntry).toBe(true);
  });

  it('confirm password input is secure text entry', () => {
    const { getByPlaceholderText } = render(<RegisterScreen />);
    expect(getByPlaceholderText('CONFIRME SUA SENHA').props.secureTextEntry).toBe(true);
  });
});
