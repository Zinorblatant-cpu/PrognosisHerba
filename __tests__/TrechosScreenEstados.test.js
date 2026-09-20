import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TrechosScreen from '../src/screens/TrechosScreen';
import TrechosService from '../src/services/TrechosService';
import LocationService from '../src/services/LocationService';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
  useFocusEffect: (callback) => require('react').useEffect(callback, []),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('../src/services/TrechosService');
jest.mock('../src/services/LocationService');

const TRECHOS = [
  {
    id: 'trecho-1',
    rodovia: 'Rodovia Anhanguera (SP-330)',
    km: 'km 78 a km 83',
    nomeTrecho: 'Trecho Jundiaí - Acesso Norte',
    latitude: -23.1857,
    longitude: -46.8979,
    statusVegetacao: 'Crítico',
    ultimaInspecao: '2026-06-02',
    previsaoIA: { nivel: 'Urgente', confianca: 94, motivo: 'Vegetação cobrindo placa.' },
    historico: [],
  },
  {
    id: 'trecho-3',
    rodovia: 'Rodovia Castello Branco (SP-280)',
    km: 'km 60 a km 65',
    nomeTrecho: 'Trecho Itu - Pista Marginal',
    latitude: -23.2639,
    longitude: -47.2997,
    statusVegetacao: 'Conforme',
    ultimaInspecao: '2026-06-08',
    previsaoIA: { nivel: 'Não necessária', confianca: 90, motivo: 'Sem crescimento acelerado.' },
    historico: [],
  },
];

describe('TrechosScreen — estados e filtros (Sprint 3)', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    TrechosService.getTrechos.mockResolvedValue(TRECHOS);
    LocationService.getCurrentPosition.mockResolvedValue(null);
    LocationService.getDistanceKm.mockReturnValue(10);
  });

  it('exibe o estado de carregamento antes da resposta do serviço', async () => {
    const { getByTestId, findByText } = render(<TrechosScreen />);
    expect(getByTestId('trechos-loading')).toBeTruthy();
    await findByText('Trecho Jundiaí - Acesso Norte');
  });

  it('exibe o estado de lista vazia quando a API não retorna trechos', async () => {
    TrechosService.getTrechos.mockResolvedValue([]);
    const { findByTestId } = render(<TrechosScreen />);
    expect(await findByTestId('trechos-vazio')).toBeTruthy();
  });

  it('exibe o estado de erro com ação de tentar novamente', async () => {
    TrechosService.getTrechos.mockRejectedValue(new Error('Servidor indisponível.'));
    const { findByTestId, findByText } = render(<TrechosScreen />);

    expect(await findByTestId('trechos-erro')).toBeTruthy();
    expect(await findByText('Servidor indisponível.')).toBeTruthy();
  });

  it('recarrega a lista ao tocar em tentar novamente', async () => {
    TrechosService.getTrechos.mockRejectedValueOnce(new Error('Servidor indisponível.'));
    const { findByTestId, findByText } = render(<TrechosScreen />);

    fireEvent.press(await findByTestId('trechos-erro-action'));
    expect(await findByText('Trecho Jundiaí - Acesso Norte')).toBeTruthy();
  });

  it('filtra os trechos pelo status de vegetação', async () => {
    const { findByTestId, queryByText, findByText } = render(<TrechosScreen />);
    await findByText('Trecho Jundiaí - Acesso Norte');

    fireEvent.press(await findByTestId('filtro-status-Conforme'));

    expect(await findByText('Trecho Itu - Pista Marginal')).toBeTruthy();
    expect(queryByText('Trecho Jundiaí - Acesso Norte')).toBeNull();
  });

  it('avisa quando o filtro não retorna nenhum trecho e permite limpar', async () => {
    TrechosService.getTrechos.mockResolvedValue([TRECHOS[0]]);
    const { findByTestId, findByText } = render(<TrechosScreen />);
    await findByText('Trecho Jundiaí - Acesso Norte');

    fireEvent.press(await findByTestId('filtro-status-Conforme'));
    expect(await findByTestId('trechos-filtro-vazio')).toBeTruthy();

    fireEvent.press(await findByTestId('trechos-filtro-vazio-action'));
    expect(await findByText('Trecho Jundiaí - Acesso Norte')).toBeTruthy();
  });

  it('não exibe o selo de mais próximo quando o GPS está indisponível', async () => {
    const { findByText, queryByTestId } = render(<TrechosScreen />);
    await findByText('Trecho Jundiaí - Acesso Norte');

    expect(queryByTestId('trecho-mais-proximo-trecho-1')).toBeNull();
  });
});
