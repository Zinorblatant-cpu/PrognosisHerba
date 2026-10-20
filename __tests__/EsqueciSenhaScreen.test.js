import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EsqueciSenhaScreen from '../src/screens/EsqueciSenhaScreen';
import AuthService from '../src/services/AuthService';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const mockReset = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ reset: mockReset, goBack: mockGoBack }),
  useRoute: () => ({ params: {} }),
}));

describe('EsqueciSenhaScreen', () => {
  beforeEach(async () => {
    mockReset.mockClear();
    await AsyncStorage.clear();
    await AuthService.registerAccount({ email: 'maria@motiva.com', senha: 'senha123' });
  });

  it('valida o email antes de pedir o código', async () => {
    const { getByTestId, findByText } = render(<EsqueciSenhaScreen />);
    fireEvent.changeText(getByTestId('recuperar-email-input'), 'invalido');
    fireEvent.press(getByTestId('enviar-codigo-button'));
    expect(await findByText('Email inválido')).toBeTruthy();
  });

  it('avisa quando o email não tem conta', async () => {
    const { getByTestId, findByTestId } = render(<EsqueciSenhaScreen />);
    fireEvent.changeText(getByTestId('recuperar-email-input'), 'ninguem@motiva.com');
    fireEvent.press(getByTestId('enviar-codigo-button'));
    expect((await findByTestId('recuperar-falha')).props.children).toMatch('Não encontramos');
  });

  it('fluxo completo: código → nova senha → login com a nova senha', async () => {
    const { getByTestId, findByTestId } = render(<EsqueciSenhaScreen />);
    fireEvent.changeText(getByTestId('recuperar-email-input'), 'maria@motiva.com');
    fireEvent.press(getByTestId('enviar-codigo-button'));

    const codigo = (await findByTestId('codigo-demo')).props.children;
    fireEvent.changeText(getByTestId('codigo-input'), codigo);
    fireEvent.changeText(getByTestId('nova-senha-input'), 'novaSenha9');
    fireEvent.changeText(getByTestId('confirmar-nova-senha-input'), 'novaSenha9');
    fireEvent.press(getByTestId('redefinir-senha-button'));

    await findByTestId('senha-redefinida');
    await expect(AuthService.login({ email: 'maria@motiva.com', senha: 'novaSenha9' })).resolves.toBeTruthy();

    fireEvent.press(getByTestId('voltar-login-button'));
    expect(mockReset).toHaveBeenCalledWith({ index: 0, routes: [{ name: 'Login' }] });
  });

  it('valida a nova senha e a confirmação', async () => {
    const { getByTestId, findByTestId, findByText } = render(<EsqueciSenhaScreen />);
    fireEvent.changeText(getByTestId('recuperar-email-input'), 'maria@motiva.com');
    fireEvent.press(getByTestId('enviar-codigo-button'));
    await findByTestId('codigo-demo');

    fireEvent.changeText(getByTestId('codigo-input'), '123');
    fireEvent.changeText(getByTestId('nova-senha-input'), 'abc');
    fireEvent.press(getByTestId('redefinir-senha-button'));

    expect(await findByText('Digite o código de 6 dígitos')).toBeTruthy();
    expect(await findByText('A senha precisa ter pelo menos 6 caracteres')).toBeTruthy();
  });
});
