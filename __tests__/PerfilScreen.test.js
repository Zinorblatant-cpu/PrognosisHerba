import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PerfilScreen from '../src/screens/PerfilScreen';
import MockScenarioService from '../src/services/MockScenarioService';
import TrechosService from '../src/services/TrechosService';
import { CENARIOS } from '../src/mocks/mockScenarios';

const mockNavigate = jest.fn();
const mockReset = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, reset: mockReset, goBack: mockGoBack }),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('PerfilScreen', () => {
  beforeEach(async () => {
    mockNavigate.mockClear();
    mockReset.mockClear();
    mockGoBack.mockClear();
    await AsyncStorage.clear();
  });

  it('exibe os dados do operador logado', async () => {
    await AsyncStorage.setItem(
      '@prognosisherba:user',
      JSON.stringify({ nome: 'Maria Souza', email: 'maria@motiva.com' })
    );

    const { findByTestId } = render(<PerfilScreen />);
    expect((await findByTestId('perfil-nome')).props.children).toBe('Maria Souza');
    expect((await findByTestId('perfil-email')).props.children).toBe('maria@motiva.com');
  });

  it('cai no usuário do mock quando não há sessão salva', async () => {
    const { findByTestId } = render(<PerfilScreen />);
    expect((await findByTestId('perfil-nome')).props.children).toBe('João Silva');
  });

  it('lista os quatro cenários de demonstração', async () => {
    const { findByTestId } = render(<PerfilScreen />);
    expect(await findByTestId('cenario-sucesso')).toBeTruthy();
    expect(await findByTestId('cenario-vazio')).toBeTruthy();
    expect(await findByTestId('cenario-erro')).toBeTruthy();
    expect(await findByTestId('cenario-lento')).toBeTruthy();
  });

  it('troca o cenário de mock e confirma na tela', async () => {
    const { findByTestId } = render(<PerfilScreen />);

    fireEvent.press(await findByTestId('cenario-erro'));

    await waitFor(async () => {
      expect(await MockScenarioService.getCenario()).toBe(CENARIOS.ERRO);
    });

    const mensagem = await findByTestId('perfil-mensagem');
    expect(mensagem.props.children).toContain('Erro de conexão');
  });

  it('restaura os dados de demonstração e volta ao cenário padrão', async () => {
    await MockScenarioService.setCenario(CENARIOS.VAZIO);
    await TrechosService.resetarDados();
    await TrechosService.registerInspecao('trecho-1', {
      status: 'Conforme',
      observacao: 'Poda concluída.',
      tecnico: 'João Silva',
    });

    const { findByTestId, findByText } = render(<PerfilScreen />);
    fireEvent.press(await findByTestId('restaurar-dados-button'));

    expect(await findByText(/restaurados ao estado original/)).toBeTruthy();
    expect(await MockScenarioService.getCenario()).toBe(CENARIOS.SUCESSO);
    expect((await TrechosService.getTrechoById('trecho-1')).statusVegetacao).toBe('Crítico');
  });

  it('limpa a sessão e reseta a navegação ao sair da conta', async () => {
    await AsyncStorage.setItem('@prognosisherba:user', JSON.stringify({ email: 'joao@motiva.com' }));

    const { findByTestId } = render(<PerfilScreen />);
    fireEvent.press(await findByTestId('perfil-logout-button'));

    await waitFor(async () => {
      expect(await AsyncStorage.getItem('@prognosisherba:user')).toBeNull();
      expect(mockReset).toHaveBeenCalledWith({ index: 0, routes: [{ name: 'Register' }] });
    });
  });
});
