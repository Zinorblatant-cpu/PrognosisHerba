import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PerfilScreen from '../src/screens/PerfilScreen';

// Simula a build de release (APK): modo de demonstração oculto por padrão.
jest.mock('../src/config/app', () => ({
  MODO_DEMO_PADRAO: false,
  TOQUES_PARA_LIBERAR_DEMO: 5,
  VERSAO_APP: '1.0.0',
  NOME_VERSAO: 'Sprint 4 — versão final',
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), reset: jest.fn(), goBack: jest.fn() }),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('PerfilScreen — modo de demonstração na build de release', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('não mostra os cenários de mock para o operador', async () => {
    const { findByTestId, queryByTestId } = render(<PerfilScreen />);
    await findByTestId('versao-app');
    expect(queryByTestId('modo-demo-card')).toBeNull();
    expect(queryByTestId('cenario-erro')).toBeNull();
  });

  it('libera o modo após 5 toques na versão e lembra a escolha', async () => {
    const { findByTestId, getByTestId, queryByTestId, unmount } = render(<PerfilScreen />);
    const versao = await findByTestId('versao-app');

    for (let i = 0; i < 4; i++) fireEvent.press(versao);
    expect(queryByTestId('modo-demo-card')).toBeNull();

    fireEvent.press(versao);
    expect(await findByTestId('modo-demo-card')).toBeTruthy();
    expect(getByTestId('cenario-erro')).toBeTruthy();
    unmount();

    const segunda = render(<PerfilScreen />);
    expect(await segunda.findByTestId('modo-demo-card')).toBeTruthy();
  });

  it('"Ocultar" esconde o modo e volta ao cenário normal', async () => {
    await AsyncStorage.setItem('@prognosisherba:modoDemoLiberado', 'true');
    await AsyncStorage.setItem('@prognosisherba:cenarioMock', 'erro');
    const { findByTestId, queryByTestId } = render(<PerfilScreen />);

    fireEvent.press(await findByTestId('ocultar-demo-button'));
    await findByTestId('versao-app');
    await new Promise((r) => setTimeout(r, 0));
    expect(queryByTestId('modo-demo-card')).toBeNull();
    expect(await AsyncStorage.getItem('@prognosisherba:cenarioMock')).toBe('sucesso');
  });
});
