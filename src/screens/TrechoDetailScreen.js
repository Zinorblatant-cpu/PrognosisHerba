import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../theme/colors';
import TrechosService from '../services/TrechosService';
import { PREVISAO_IA_INFO } from '../constants/previsaoIA';

const STATUS_OPTIONS = [
  { key: 'conforme', value: 'Conforme', emoji: '🟢' },
  { key: 'atencao', value: 'Atenção', emoji: '🟡' },
  { key: 'critico', value: 'Crítico', emoji: '🔴' },
];

const TECNICO = 'João Silva';

export default function TrechoDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { trechoId } = route.params;

  const [trecho, setTrecho] = useState(null);
  const [statusSelecionado, setStatusSelecionado] = useState(null);
  const [observacao, setObservacao] = useState('');
  const [podaRealizada, setPodaRealizada] = useState(null);
  const [previsaoCorreta, setPrevisaoCorreta] = useState(null);
  const [feedbackSalvoEm, setFeedbackSalvoEm] = useState(null);

  useEffect(() => {
    let isMounted = true;
    TrechosService.getTrechoById(trechoId).then((data) => {
      if (!isMounted) return;
      setTrecho(data);
      setStatusSelecionado(data?.statusVegetacao || null);
      setPodaRealizada(data?.feedbackPodador?.podaRealizada ?? null);
      setPrevisaoCorreta(data?.feedbackPodador?.previsaoCorreta ?? null);
      setFeedbackSalvoEm(data?.feedbackPodador?.dataFeedback ?? null);
    });
    return () => {
      isMounted = false;
    };
  }, [trechoId]);

  async function handleRegistrarInspecao() {
    if (!statusSelecionado || !observacao.trim()) return;

    const atualizado = await TrechosService.registerInspecao(trechoId, {
      status: statusSelecionado,
      observacao: observacao.trim(),
      tecnico: TECNICO,
    });

    setTrecho(atualizado);
    setObservacao('');
  }

  async function handleSalvarFeedback() {
    if (podaRealizada === null || previsaoCorreta === null) return;

    const atualizado = await TrechosService.registerFeedback(trechoId, {
      podaRealizada,
      previsaoCorreta,
    });

    setTrecho(atualizado);
    setFeedbackSalvoEm(atualizado.feedbackPodador.dataFeedback);
  }

  if (!trecho) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          testID="back-button"
          onPress={() => navigation.goBack()}
          accessibilityLabel="voltar"
        >
          <Text style={styles.backArrow}>‹ Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{trecho.nomeTrecho}</Text>
        <Text style={styles.subtitle}>{trecho.rodovia}</Text>
        <Text style={styles.subtitle}>{trecho.km}</Text>
        <Text testID="status-atual" style={styles.statusAtual}>
          Status atual: {trecho.statusVegetacao}
        </Text>

        {trecho.previsaoIA && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🤖 Previsão de IA</Text>
            <Text testID="previsao-ia-nivel" style={styles.previsaoNivel}>
              {['Nível de urgência: ', `${(PREVISAO_IA_INFO[trecho.previsaoIA.nivel] || {}).emoji || ''} ${trecho.previsaoIA.nivel}`]}
            </Text>
            <Text testID="previsao-ia-confianca" style={styles.previsaoConfianca}>
              {['Confiança do modelo: ', `${trecho.previsaoIA.confianca}%`]}
            </Text>
            <Text testID="previsao-ia-motivo" style={styles.previsaoMotivo}>
              {trecho.previsaoIA.motivo}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feedback da poda</Text>

          <Text style={styles.feedbackQuestion}>Você realizou a poda neste trecho?</Text>
          <View style={styles.statusOptions}>
            <TouchableOpacity
              testID="feedback-poda-sim"
              style={[styles.statusOption, podaRealizada === true && styles.statusOptionSelected]}
              onPress={() => setPodaRealizada(true)}
            >
              <Text style={[styles.statusOptionText, podaRealizada === true && styles.statusOptionTextSelected]}>
                Sim
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="feedback-poda-nao"
              style={[styles.statusOption, podaRealizada === false && styles.statusOptionSelected]}
              onPress={() => setPodaRealizada(false)}
            >
              <Text style={[styles.statusOptionText, podaRealizada === false && styles.statusOptionTextSelected]}>
                Não
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.feedbackQuestion}>A previsão de IA acertou o nível de urgência?</Text>
          <View style={styles.statusOptions}>
            <TouchableOpacity
              testID="feedback-previsao-sim"
              style={[styles.statusOption, previsaoCorreta === true && styles.statusOptionSelected]}
              onPress={() => setPrevisaoCorreta(true)}
            >
              <Text style={[styles.statusOptionText, previsaoCorreta === true && styles.statusOptionTextSelected]}>
                Sim
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="feedback-previsao-nao"
              style={[styles.statusOption, previsaoCorreta === false && styles.statusOptionSelected]}
              onPress={() => setPrevisaoCorreta(false)}
            >
              <Text style={[styles.statusOptionText, previsaoCorreta === false && styles.statusOptionTextSelected]}>
                Não
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            testID="salvar-feedback-button"
            style={styles.button}
            onPress={handleSalvarFeedback}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>SALVAR FEEDBACK</Text>
          </TouchableOpacity>

          {feedbackSalvoEm && (
            <Text testID="feedback-confirmacao" style={styles.feedbackConfirmacao}>
              Feedback registrado em {feedbackSalvoEm}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Registrar inspeção</Text>

          <View style={styles.statusOptions}>
            {STATUS_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.key}
                testID={`status-option-${option.key}`}
                style={[
                  styles.statusOption,
                  statusSelecionado === option.value && styles.statusOptionSelected,
                ]}
                onPress={() => setStatusSelecionado(option.value)}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    statusSelecionado === option.value && styles.statusOptionTextSelected,
                  ]}
                >
                  {`${option.emoji} ${option.value}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            testID="observacao-input"
            style={styles.input}
            placeholder="Descreva a observação da inspeção"
            placeholderTextColor={colors.textMuted}
            value={observacao}
            onChangeText={setObservacao}
            multiline
          />

          <TouchableOpacity
            testID="registrar-inspecao-button"
            style={styles.button}
            onPress={handleRegistrarInspecao}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>REGISTRAR INSPEÇÃO</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico de inspeções</Text>
          {trecho.historico.map((item, index) => (
            <View key={`${item.data}-${index}`} testID={`historico-item-${index}`} style={styles.historicoItem}>
              <Text style={styles.historicoData}>{item.data} — {item.status}</Text>
              <Text style={styles.historicoObs}>{item.observacao}</Text>
              <Text style={styles.historicoTecnico}>{item.tecnico}</Text>
            </View>
          ))}
        </View>
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
  },
  backArrow: {
    color: colors.primary,
    fontSize: 14,
    marginBottom: 12,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  statusAtual: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
  },
  previsaoNivel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  previsaoConfianca: {
    color: colors.textLabel,
    fontSize: 12,
    marginTop: 4,
  },
  previsaoMotivo: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 8,
    lineHeight: 18,
  },
  feedbackQuestion: {
    color: colors.textLabel,
    fontSize: 13,
    marginBottom: 8,
  },
  feedbackConfirmacao: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 14,
    marginTop: 16,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusOptions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statusOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  statusOptionSelected: {
    backgroundColor: colors.primary,
  },
  statusOptionText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  statusOptionTextSelected: {
    color: colors.background,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    borderRadius: 6,
    backgroundColor: colors.inputBackground,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 1,
  },
  historicoItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
    paddingVertical: 10,
  },
  historicoData: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  historicoObs: {
    color: colors.textLabel,
    fontSize: 12,
    marginTop: 4,
  },
  historicoTecnico: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
});
