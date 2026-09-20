import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import OptionRow from '../components/OptionRow';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import InlineMessage from '../components/InlineMessage';
import StateView from '../components/StateView';
import AgendaService from '../services/AgendaService';
import { DATA_REFERENCIA } from '../mocks/agendaMock';

// Tela única para os dois cards de "Atividades do Dia" do Dashboard:
//   tipo = 'poda'     → confirma o turno da poda do dia
//   tipo = 'ausencia' → registra e justifica a ausência (fluxo alternativo)
export default function RegistrarPodaScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const tipo = route.params?.tipo === 'ausencia' ? 'ausencia' : 'poda';
  const ehAusencia = tipo === 'ausencia';

  const [carregando, setCarregando] = useState(true);
  const [registroExistente, setRegistroExistente] = useState(null);
  const [opcaoSelecionada, setOpcaoSelecionada] = useState(null);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  const turnos = AgendaService.getTurnos();
  const motivos = AgendaService.getMotivosAusencia();
  const opcoes = ehAusencia ? motivos : turnos;

  useEffect(() => {
    let ativo = true;

    AgendaService.getRegistroDoDia(DATA_REFERENCIA.hoje)
      .then((registro) => {
        if (!ativo) return;
        setRegistroExistente(registro);
        if (registro && registro.tipo === tipo) {
          setOpcaoSelecionada(ehAusencia ? registro.motivoId : registro.turnoId);
          setTexto(ehAusencia ? registro.justificativa || '' : registro.observacao || '');
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [tipo, ehAusencia]);

  async function handleEnviar() {
    setMensagem(null);

    if (!opcaoSelecionada) {
      setMensagem({
        type: 'error',
        text: ehAusencia
          ? 'Selecione o motivo da ausência para continuar.'
          : 'Selecione o turno da poda para continuar.',
      });
      return;
    }

    if (ehAusencia && opcaoSelecionada === 'outro' && !texto.trim()) {
      setMensagem({ type: 'error', text: 'Descreva a justificativa para o motivo "Outro motivo".' });
      return;
    }

    setEnviando(true);
    try {
      if (ehAusencia) {
        const registro = await AgendaService.registrarAusencia({
          motivoId: opcaoSelecionada,
          justificativa: texto,
        });
        setRegistroExistente(registro);
        setMensagem({
          type: 'success',
          text: 'Ausência registrada e enviada para a supervisão. A agenda do dia foi atualizada.',
        });
      } else {
        const registro = await AgendaService.confirmarPoda({
          turnoId: opcaoSelecionada,
          observacao: texto,
        });
        setRegistroExistente(registro);
        setMensagem({
          type: 'success',
          text: 'Poda confirmada para hoje. A agenda do dia foi atualizada.',
        });
      }
    } catch (e) {
      setMensagem({ type: 'error', text: e.message });
    } finally {
      setEnviando(false);
    }
  }

  const jaRegistrado = registroExistente !== null;
  const conflito = jaRegistrado && registroExistente.tipo !== tipo;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <ScreenHeader
          title={ehAusencia ? 'Informar Ausência' : 'Confirmar Poda'}
          subtitle={DATA_REFERENCIA.diaExtenso}
          onBack={() => navigation.goBack()}
        />

        {carregando ? (
          <StateView testID="registro-loading" variant="loading" message="Carregando o dia..." />
        ) : (
          <>
            {conflito ? (
              <Card testID="registro-conflito" style={styles.aviso}>
                <Text style={styles.avisoTitulo}>
                  {registroExistente.tipo === 'ausencia'
                    ? '🚫 Você já informou ausência hoje'
                    : '✂️ Você já confirmou a poda de hoje'}
                </Text>
                <Text style={styles.avisoTexto}>
                  {registroExistente.tipo === 'ausencia'
                    ? 'Confirmar a poda substitui a ausência registrada anteriormente.'
                    : 'Informar ausência cancela a confirmação de poda registrada anteriormente.'}
                </Text>
              </Card>
            ) : null}

            <Card title={ehAusencia ? 'Motivo da ausência' : 'Turno da poda'}>
              <View style={styles.opcoes}>
                {opcoes.map((opcao) => (
                  <OptionRow
                    key={opcao.id}
                    testID={(ehAusencia ? 'motivo-' : 'turno-') + opcao.id}
                    title={opcao.label}
                    description={ehAusencia ? opcao.descricao : opcao.horario}
                    selected={opcaoSelecionada === opcao.id}
                    onPress={() => setOpcaoSelecionada(opcao.id)}
                  />
                ))}
              </View>
            </Card>

            <Card title={ehAusencia ? 'Justificativa' : 'Observação (opcional)'}>
              <FormInput
                testID="registro-texto-input"
                placeholder={
                  ehAusencia
                    ? 'Descreva o motivo com suas palavras'
                    : 'Ex.: equipe completa, roçadeira revisada'
                }
                value={texto}
                onChangeText={setTexto}
                multiline
              />
            </Card>

            <PrimaryButton
              testID="registro-enviar-button"
              label={ehAusencia ? 'REGISTRAR AUSÊNCIA' : 'CONFIRMAR PODA'}
              onPress={handleEnviar}
              loading={enviando}
            />

            {mensagem ? <InlineMessage testID="registro-mensagem" {...mensagem} /> : null}

            {mensagem && mensagem.type === 'success' ? (
              <PrimaryButton
                testID="registro-ver-agenda"
                label="VER NA AGENDA"
                variant="secondary"
                onPress={() => navigation.navigate('Agenda')}
                style={styles.verAgenda}
              />
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 20,
    paddingTop: 16,
    flexGrow: 1,
  },
  aviso: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  avisoTitulo: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  avisoTexto: {
    color: colors.textLabel,
    fontSize: 12,
    marginTop: 6,
    lineHeight: 18,
  },
  opcoes: {
    marginTop: 12,
  },
  verAgenda: {
    marginTop: 12,
  },
});
