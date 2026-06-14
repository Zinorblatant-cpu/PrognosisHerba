import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import TrechoDetailScreen from '../src/screens/TrechoDetailScreen';
import TrechosService from '../src/services/TrechosService';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockGoBack }),
  useRoute: () => ({ params: { trechoId: 'trecho-3' } }),
}));

jest.mock('../src/services/TrechosService');

const TRECHO = {
  id: 'trecho-3',
  rodovia: 'Rodovia Castello Branco (SP-280)',
  km: 'km 60 a km 65',
  nomeTrecho: 'Trecho Itu - Pista Marginal',
  latitude: -23.2639,
  longitude: -47.2997,
  statusVegetacao: 'Conforme',
  ultimaInspecao: '2026-06-08',
  previsaoIA: {
    nivel: 'Não necessária',
    confianca: 88,
    motivo: 'Poda recente e sem indícios de crescimento acelerado.',
  },
  feedbackPodador: {
    podaRealizada: null,
    previsaoCorreta: null,
    dataFeedback: null,
  },
  historico: [
    {
      data: '2026-06-08',
      status: 'Conforme',
      observacao: 'Poda realizada conforme cronograma. Sem pendências.',
      tecnico: 'João Silva',
    },
  ],
};

describe('TrechoDetailScreen', () => {
  beforeEach(() => {
    mockGoBack.mockClear();
    TrechosService.getTrechoById.mockResolvedValue(TRECHO);
    TrechosService.registerInspecao.mockResolvedValue({
      ...TRECHO,
      statusVegetacao: 'Atenção',
      ultimaInspecao: '2026-06-12',
      historico: [
        {
          data: '2026-06-12',
          status: 'Atenção',
          observacao: 'Vegetação voltou a crescer na faixa lateral.',
          tecnico: 'João Silva',
        },
        ...TRECHO.historico,
      ],
    });
    TrechosService.registerFeedback.mockResolvedValue({
      ...TRECHO,
      feedbackPodador: {
        podaRealizada: true,
        previsaoCorreta: false,
        dataFeedback: '2026-06-13',
      },
    });
  });

  it('renders trecho details', async () => {
    const { findByText } = render(<TrechoDetailScreen />);
    expect(await findByText('Trecho Itu - Pista Marginal')).toBeTruthy();
    expect(await findByText('Rodovia Castello Branco (SP-280)')).toBeTruthy();
  });

  it('renders inspection history entries', async () => {
    const { findByText } = render(<TrechoDetailScreen />);
    expect(await findByText('Poda realizada conforme cronograma. Sem pendências.')).toBeTruthy();
  });

  it('renders status selection options', async () => {
    const { findByTestId } = render(<TrechoDetailScreen />);
    expect(await findByTestId('status-option-conforme')).toBeTruthy();
    expect(await findByTestId('status-option-atencao')).toBeTruthy();
    expect(await findByTestId('status-option-critico')).toBeTruthy();
  });

  it('renders the AI prediction level, confidence and reason', async () => {
    const { findByTestId } = render(<TrechoDetailScreen />);

    const nivel = await findByTestId('previsao-ia-nivel');
    expect(nivel.props.children.join('')).toContain('Não necessária');

    const confianca = await findByTestId('previsao-ia-confianca');
    expect(confianca.props.children.join('')).toContain('88%');

    const motivo = await findByTestId('previsao-ia-motivo');
    expect(motivo.props.children).toBe('Poda recente e sem indícios de crescimento acelerado.');
  });

  it('registers operator feedback about pruning execution and AI accuracy', async () => {
    const { findByTestId, findByText } = render(<TrechoDetailScreen />);

    fireEvent.press(await findByTestId('feedback-poda-sim'));
    fireEvent.press(await findByTestId('feedback-previsao-nao'));
    fireEvent.press(await findByTestId('salvar-feedback-button'));

    await waitFor(() => {
      expect(TrechosService.registerFeedback).toHaveBeenCalledWith('trecho-3', {
        podaRealizada: true,
        previsaoCorreta: false,
      });
    });

    expect(await findByText(/Feedback registrado/)).toBeTruthy();
  });

  it('registers a new inspection and updates the displayed status and history', async () => {
    const { findByTestId, findByText } = render(<TrechoDetailScreen />);

    fireEvent.press(await findByTestId('status-option-atencao'));
    fireEvent.changeText(
      await findByTestId('observacao-input'),
      'Vegetação voltou a crescer na faixa lateral.'
    );
    fireEvent.press(await findByTestId('registrar-inspecao-button'));

    await waitFor(() => {
      expect(TrechosService.registerInspecao).toHaveBeenCalledWith('trecho-3', {
        status: 'Atenção',
        observacao: 'Vegetação voltou a crescer na faixa lateral.',
        tecnico: 'João Silva',
      });
    });

    expect(await findByText('Vegetação voltou a crescer na faixa lateral.')).toBeTruthy();
  });
});
