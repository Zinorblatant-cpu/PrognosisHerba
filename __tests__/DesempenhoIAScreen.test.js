import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import DesempenhoIAScreen from '../src/screens/DesempenhoIAScreen';
import DesempenhoIAService, { consolidar } from '../src/services/DesempenhoIAService';
import { gerarTrechosMock } from '../src/mocks/trechosMock';
import { gerarFeedbacksHistoricos } from '../src/mocks/feedbackIAMock';
import PrevisaoIAService from '../src/services/PrevisaoIAService';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
  useFocusEffect: (callback) => require('react').useEffect(callback, []),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('../src/services/DesempenhoIAService', () => {
  const real = jest.requireActual('../src/services/DesempenhoIAService');
  return { __esModule: true, consolidar: real.consolidar, default: { getResumo: jest.fn() } };
});

const BASE = new Date(2026, 5, 16);
const RESUMO = consolidar(PrevisaoIAService.aplicar(gerarTrechosMock(BASE), BASE), gerarFeedbacksHistoricos(BASE));

describe('DesempenhoIAScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    DesempenhoIAService.getResumo.mockResolvedValue(RESUMO);
  });

  it('mostra a taxa de acerto consolidada', async () => {
    const { findByTestId, getByTestId } = render(<DesempenhoIAScreen />);
    expect((await findByTestId('desempenho-taxa')).props.children).toBe('75%');
    expect(getByTestId('desempenho-contagem').props.children).toBe('9 de 12 previsões confirmadas pelos podadores');
  });

  it('lista o acerto por nível e por trecho', async () => {
    const { findByTestId, getByTestId } = render(<DesempenhoIAScreen />);
    await findByTestId('desempenho-nivel-Urgente');
    expect(getByTestId('desempenho-nivel-Atenção')).toBeTruthy();
    expect(getByTestId('desempenho-trecho-trecho-1')).toBeTruthy();
  });

  it('abre o detalhe ao tocar em um trecho', async () => {
    const { findByTestId } = render(<DesempenhoIAScreen />);
    fireEvent.press(await findByTestId('desempenho-trecho-trecho-4'));
    expect(mockNavigate).toHaveBeenCalledWith('TrechoDetail', { trechoId: 'trecho-4' });
  });

  it('estado vazio leva para os trechos', async () => {
    DesempenhoIAService.getResumo.mockResolvedValue(consolidar([], []));
    const { findByTestId } = render(<DesempenhoIAScreen />);
    fireEvent.press(await findByTestId('desempenho-vazio-action'));
    expect(mockNavigate).toHaveBeenCalledWith('Trechos');
  });

  it('estado de erro com nova tentativa', async () => {
    DesempenhoIAService.getResumo.mockRejectedValueOnce(new Error('Servidor indisponível.'));
    const { findByTestId } = render(<DesempenhoIAScreen />);
    fireEvent.press(await findByTestId('desempenho-erro-action'));
    expect(await findByTestId('desempenho-taxa')).toBeTruthy();
  });
});
