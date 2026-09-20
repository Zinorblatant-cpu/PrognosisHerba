import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import TrechosScreen from '../src/screens/TrechosScreen';
import TrechosService from '../src/services/TrechosService';
import LocationService from '../src/services/LocationService';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
  // A lista recarrega ao voltar do detalhe; no teste equivale a montar a tela.
  useFocusEffect: (callback) => require('react').useEffect(callback, []),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('../src/services/TrechosService');
jest.mock('../src/services/LocationService');

const TRECHOS = [
  {
    id: 'trecho-2',
    rodovia: 'Rodovia dos Bandeirantes (SP-348)',
    km: 'km 45 a km 50',
    nomeTrecho: 'Trecho Várzea Paulista',
    latitude: -23.2147,
    longitude: -46.8242,
    statusVegetacao: 'Atenção',
    ultimaInspecao: '2026-05-28',
    previsaoIA: { nivel: 'Atenção', confianca: 81, motivo: 'Vegetação se aproximando da faixa de domínio.' },
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
    previsaoIA: { nivel: 'Não necessária', confianca: 90, motivo: 'Sem sinais de crescimento acelerado.' },
    historico: [],
  },
  {
    id: 'trecho-1',
    rodovia: 'Rodovia Anhanguera (SP-330)',
    km: 'km 78 a km 83',
    nomeTrecho: 'Trecho Jundiaí - Acesso Norte',
    latitude: -23.1857,
    longitude: -46.8979,
    statusVegetacao: 'Crítico',
    ultimaInspecao: '2026-06-02',
    previsaoIA: { nivel: 'Urgente', confianca: 94, motivo: 'Vegetação cobrindo placa de sinalização.' },
    historico: [],
  },
];

describe('TrechosScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    TrechosService.getTrechos.mockResolvedValue(TRECHOS);
    LocationService.getCurrentPosition.mockResolvedValue({ latitude: -23.1857, longitude: -46.8979 });
    LocationService.getDistanceKm.mockImplementation((a, b) =>
      a.latitude === b.latitude && a.longitude === b.longitude ? 0 : 999
    );
  });

  it('renders the screen title', async () => {
    const { getByText, findByText } = render(<TrechosScreen />);
    expect(getByText('Trechos da Rodovia')).toBeTruthy();
    await findByText('Trecho Jundiaí - Acesso Norte');
  });

  it('renders trechos loaded from TrechosService', async () => {
    const { findByText } = render(<TrechosScreen />);
    expect(await findByText('Trecho Jundiaí - Acesso Norte')).toBeTruthy();
    expect(await findByText('Trecho Várzea Paulista')).toBeTruthy();
  });

  it('renders status badge with vegetation status for each trecho', async () => {
    const { findByTestId } = render(<TrechosScreen />);
    const badge = await findByTestId('status-badge-trecho-1');
    expect(badge.props.children).toContain('Crítico');
  });

  it('renders AI prediction badge with urgency level and confidence for each trecho', async () => {
    const { findByTestId } = render(<TrechosScreen />);
    const badge = await findByTestId('previsao-badge-trecho-1');
    const text = badge.props.children.join('');
    expect(text).toContain('Urgente');
    expect(text).toContain('94%');
  });

  it('orders trechos by AI prediction priority, most urgent first', async () => {
    const { findAllByText } = render(<TrechosScreen />);
    const titles = await findAllByText(/Trecho /);
    expect(titles[0].props.children).toBe('Trecho Jundiaí - Acesso Norte');
    expect(titles[1].props.children).toBe('Trecho Várzea Paulista');
    expect(titles[2].props.children).toBe('Trecho Itu - Pista Marginal');
  });

  it('shows current GPS location when available', async () => {
    const { findByTestId } = render(<TrechosScreen />);
    const location = await findByTestId('location-info');
    expect(location.props.children).toContain('-23.1857');
  });

  it('shows fallback message when GPS location is unavailable', async () => {
    LocationService.getCurrentPosition.mockResolvedValue(null);
    const { findByTestId } = render(<TrechosScreen />);
    const location = await findByTestId('location-info');
    expect(location.props.children).toContain('indisponível');
  });

  it('marks the nearest trecho to the current location', async () => {
    const { findByTestId } = render(<TrechosScreen />);
    expect(await findByTestId('trecho-mais-proximo-trecho-1')).toBeTruthy();
  });

  it('navigates to TrechoDetail with trechoId when a trecho is pressed', async () => {
    const { findByTestId } = render(<TrechosScreen />);
    const item = await findByTestId('trecho-item-trecho-2');
    fireEvent.press(item);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('TrechoDetail', { trechoId: 'trecho-2' });
    });
  });
});
