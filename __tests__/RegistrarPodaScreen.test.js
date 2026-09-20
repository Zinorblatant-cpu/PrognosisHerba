import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RegistrarPodaScreen from '../src/screens/RegistrarPodaScreen';
import AgendaService from '../src/services/AgendaService';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
let mockRotaParams = { tipo: 'poda' };

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
  useRoute: () => ({ params: mockRotaParams }),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('../src/services/AgendaService');

const TURNOS = [
  { id: 'manha', label: 'Manhã', horario: '07:00 - 12:00' },
  { id: 'integral', label: 'Integral', horario: '09:00 - 17:00' },
];

const MOTIVOS = [
  { id: 'chuva', label: 'Condições climáticas', descricao: 'Chuva ou pista molhada.' },
  { id: 'outro', label: 'Outro motivo', descricao: 'Descreva no campo abaixo.' },
];

describe('RegistrarPodaScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockGoBack.mockClear();
    mockRotaParams = { tipo: 'poda' };

    AgendaService.getTurnos.mockReturnValue(TURNOS);
    AgendaService.getMotivosAusencia.mockReturnValue(MOTIVOS);
    AgendaService.getRegistroDoDia.mockResolvedValue(null);
    AgendaService.confirmarPoda.mockResolvedValue({
      tipo: 'poda',
      turnoId: 'manha',
      turnoHorario: '07:00 - 12:00',
    });
    AgendaService.registrarAusencia.mockResolvedValue({
      tipo: 'ausencia',
      motivoId: 'chuva',
      motivoLabel: 'Condições climáticas',
    });
  });

  describe('fluxo Poda', () => {
    it('exibe o título de confirmação de poda e os turnos disponíveis', async () => {
      const { findByText, findByTestId } = render(<RegistrarPodaScreen />);
      expect(await findByText('Confirmar Poda')).toBeTruthy();
      expect(await findByTestId('turno-manha')).toBeTruthy();
      expect(await findByTestId('turno-integral')).toBeTruthy();
    });

    it('bloqueia o envio quando nenhum turno é selecionado', async () => {
      const { findByTestId, findByText } = render(<RegistrarPodaScreen />);
      fireEvent.press(await findByTestId('registro-enviar-button'));

      expect(await findByText(/Selecione o turno/)).toBeTruthy();
      expect(AgendaService.confirmarPoda).not.toHaveBeenCalled();
    });

    it('confirma a poda com o turno e a observação informados', async () => {
      const { findByTestId, findByText } = render(<RegistrarPodaScreen />);

      fireEvent.press(await findByTestId('turno-manha'));
      fireEvent.changeText(await findByTestId('registro-texto-input'), 'Equipe completa.');
      fireEvent.press(await findByTestId('registro-enviar-button'));

      await waitFor(() => {
        expect(AgendaService.confirmarPoda).toHaveBeenCalledWith({
          turnoId: 'manha',
          observacao: 'Equipe completa.',
        });
      });
      expect(await findByText(/Poda confirmada para hoje/)).toBeTruthy();
    });

    it('oferece atalho para a agenda após confirmar', async () => {
      const { findByTestId } = render(<RegistrarPodaScreen />);

      fireEvent.press(await findByTestId('turno-integral'));
      fireEvent.press(await findByTestId('registro-enviar-button'));

      fireEvent.press(await findByTestId('registro-ver-agenda'));
      expect(mockNavigate).toHaveBeenCalledWith('Agenda');
    });

    it('exibe a mensagem de erro quando a gravação falha', async () => {
      AgendaService.confirmarPoda.mockRejectedValue(new Error('Não foi possível salvar.'));
      const { findByTestId, findByText } = render(<RegistrarPodaScreen />);

      fireEvent.press(await findByTestId('turno-manha'));
      fireEvent.press(await findByTestId('registro-enviar-button'));

      expect(await findByText('Não foi possível salvar.')).toBeTruthy();
    });

    it('avisa quando já existe ausência registrada para o dia', async () => {
      AgendaService.getRegistroDoDia.mockResolvedValue({
        tipo: 'ausencia',
        motivoId: 'chuva',
        motivoLabel: 'Condições climáticas',
      });

      const { findByTestId } = render(<RegistrarPodaScreen />);
      expect(await findByTestId('registro-conflito')).toBeTruthy();
    });
  });

  describe('fluxo Não Poda', () => {
    beforeEach(() => {
      mockRotaParams = { tipo: 'ausencia' };
    });

    it('exibe o título de ausência e a lista de motivos', async () => {
      const { findByText, findByTestId } = render(<RegistrarPodaScreen />);
      expect(await findByText('Informar Ausência')).toBeTruthy();
      expect(await findByTestId('motivo-chuva')).toBeTruthy();
    });

    it('bloqueia o envio quando nenhum motivo é selecionado', async () => {
      const { findByTestId, findByText } = render(<RegistrarPodaScreen />);
      fireEvent.press(await findByTestId('registro-enviar-button'));

      expect(await findByText(/Selecione o motivo/)).toBeTruthy();
      expect(AgendaService.registrarAusencia).not.toHaveBeenCalled();
    });

    it('exige justificativa escrita quando o motivo é "Outro motivo"', async () => {
      const { findByTestId, findByText } = render(<RegistrarPodaScreen />);

      fireEvent.press(await findByTestId('motivo-outro'));
      fireEvent.press(await findByTestId('registro-enviar-button'));

      expect(await findByText(/Descreva a justificativa/)).toBeTruthy();
      expect(AgendaService.registrarAusencia).not.toHaveBeenCalled();
    });

    it('registra a ausência com motivo e justificativa', async () => {
      const { findByTestId, findByText } = render(<RegistrarPodaScreen />);

      fireEvent.press(await findByTestId('motivo-chuva'));
      fireEvent.changeText(await findByTestId('registro-texto-input'), 'Pista molhada.');
      fireEvent.press(await findByTestId('registro-enviar-button'));

      await waitFor(() => {
        expect(AgendaService.registrarAusencia).toHaveBeenCalledWith({
          motivoId: 'chuva',
          justificativa: 'Pista molhada.',
        });
      });
      expect(await findByText(/Ausência registrada/)).toBeTruthy();
    });
  });
});
