import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import StateView from '../components/StateView';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import InlineMessage from '../components/InlineMessage';
import TrechosService from '../services/TrechosService';
import LocationService from '../services/LocationService';
import FotoService from '../services/FotoService';
import AuthService from '../services/AuthService';
import { formatarDataCurta } from '../utils/datas';
import { PREVISAO_IA_INFO } from '../constants/previsaoIA';
import { STATUS_VEGETACAO_OPTIONS } from '../constants/statusVegetacao';

const TECNICO_PADRAO = 'João Silva';

// Botão Sim/Não dos formulários de feedback, com estado acessível.
function Escolha({ testID, label, selecionado, onPress }) {
  return (
    <TouchableOpacity
      testID={testID}
      style={[styles.statusOption, selecionado && styles.statusOptionSelected]}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: !!selecionado }}
      accessibilityLabel={label}
    >
      <Text style={[styles.statusOptionText, selecionado && styles.statusOptionTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function TrechoDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { trechoId } = route.params;

  const [trecho, setTrecho] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [statusSelecionado, setStatusSelecionado] = useState(null);
  const [observacao, setObservacao] = useState('');
  const [salvandoInspecao, setSalvandoInspecao] = useState(false);
  const [mensagemInspecao, setMensagemInspecao] = useState(null);
  const [foto, setFoto] = useState(null);
  const [mensagemFoto, setMensagemFoto] = useState(null);
  const [mensagemMapa, setMensagemMapa] = useState(null);
  const [tecnico, setTecnico] = useState(TECNICO_PADRAO);

  const [podaRealizada, setPodaRealizada] = useState(null);
  const [previsaoCorreta, setPrevisaoCorreta] = useState(null);
  const [salvandoFeedback, setSalvandoFeedback] = useState(false);
  const [mensagemFeedback, setMensagemFeedback] = useState(null);
  const [feedbackSalvoEm, setFeedbackSalvoEm] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      const data = await TrechosService.getTrechoById(trechoId);
      if (!data) {
        setTrecho(null);
        setErro('Trecho não encontrado. Ele pode ter sido removido da sua escala.');
        return;
      }
      setTrecho(data);
      setStatusSelecionado(data.statusVegetacao || null);
      setPodaRealizada(data.feedbackPodador?.podaRealizada ?? null);
      setPrevisaoCorreta(data.feedbackPodador?.previsaoCorreta ?? null);
      setFeedbackSalvoEm(data.feedbackPodador?.dataFeedback ?? null);
    } catch (e) {
      setTrecho(null);
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [trechoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // A inspeção é assinada pelo usuário logado (antes era sempre "João Silva").
  useEffect(() => {
    let ativo = true;
    Promise.resolve(AuthService.getPerfil?.())
      .then((perfil) => {
        if (ativo && perfil?.nome) setTecnico(perfil.nome);
      })
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, []);

  async function anexarFoto(origem) {
    setMensagemFoto(null);
    try {
      const uri = origem === 'camera' ? await FotoService.tirarFoto() : await FotoService.escolherDaGaleria();
      if (uri) setFoto(uri);
    } catch (e) {
      setMensagemFoto({ type: 'error', text: e.message });
    }
  }

  async function abrirMapa() {
    setMensagemMapa(null);
    try {
      await LocationService.abrirNoMapa(trecho);
    } catch (e) {
      setMensagemMapa({ type: 'error', text: 'Não foi possível abrir o app de mapas neste aparelho.' });
    }
  }

  async function handleRegistrarInspecao() {
    setMensagemInspecao(null);

    if (!statusSelecionado) {
      setMensagemInspecao({ type: 'error', text: 'Selecione o status de vegetação do trecho.' });
      return;
    }
    if (!observacao.trim()) {
      setMensagemInspecao({ type: 'error', text: 'Descreva a observação da inspeção antes de registrar.' });
      return;
    }

    setSalvandoInspecao(true);
    try {
      const atualizado = await TrechosService.registerInspecao(trechoId, {
        status: statusSelecionado,
        observacao: observacao.trim(),
        tecnico,
        ...(foto ? { foto } : {}),
      });

      setTrecho(atualizado);
      setObservacao('');
      setFoto(null);
      setMensagemInspecao({
        type: 'success',
        text:
          'Inspeção registrada. A previsão de IA foi recalculada: ' +
          (atualizado.previsaoIA?.nivel || '—') +
          '.',
      });
    } catch (e) {
      setMensagemInspecao({ type: 'error', text: e.message });
    } finally {
      setSalvandoInspecao(false);
    }
  }

  async function handleSalvarFeedback() {
    setMensagemFeedback(null);

    if (podaRealizada === null || previsaoCorreta === null) {
      setMensagemFeedback({ type: 'error', text: 'Responda as duas perguntas antes de salvar o feedback.' });
      return;
    }

    setSalvandoFeedback(true);
    try {
      const atualizado = await TrechosService.registerFeedback(trechoId, {
        podaRealizada,
        previsaoCorreta,
      });

      setTrecho(atualizado);
      setFeedbackSalvoEm(atualizado.feedbackPodador.dataFeedback);
      setMensagemFeedback({
        type: 'success',
        text: 'Obrigado! Seu feedback entra no cálculo de desempenho da IA.',
      });
    } catch (e) {
      setMensagemFeedback({ type: 'error', text: e.message });
    } finally {
      setSalvandoFeedback(false);
    }
  }

  if (carregando || erro) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
          <ScreenHeader title="Detalhe do trecho" onBack={() => navigation.goBack()} />
          {carregando ? (
            <StateView testID="detalhe-loading" variant="loading" message="Carregando o trecho..." />
          ) : (
            <StateView
              testID="detalhe-erro"
              variant="error"
              title="Não foi possível abrir o trecho"
              message={erro}
              actionLabel="TENTAR NOVAMENTE"
              onAction={carregar}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!trecho) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <ScreenHeader title={trecho.nomeTrecho} onBack={() => navigation.goBack()} />

        <Text style={styles.subtitle}>{trecho.rodovia}</Text>
        <Text style={styles.subtitle}>{trecho.km}</Text>
        <Text testID="status-atual" style={styles.statusAtual}>
          Status atual: {trecho.statusVegetacao}
        </Text>

        <PrimaryButton
          testID="abrir-mapa-button"
          label="📍 ABRIR NO MAPA"
          variant="secondary"
          onPress={abrirMapa}
          style={styles.mapaBotao}
        />
        {mensagemMapa ? <InlineMessage testID="mapa-mensagem" {...mensagemMapa} /> : null}

        {trecho.previsaoIA ? (
          <Card title="🤖 Previsão de IA" style={styles.cardTopo}>
            <View style={styles.blocoConteudo}>
              <Text testID="previsao-ia-nivel" style={styles.previsaoNivel}>
                {[
                  'Nível de urgência: ',
                  ((PREVISAO_IA_INFO[trecho.previsaoIA.nivel] || {}).emoji || '') +
                    ' ' +
                    trecho.previsaoIA.nivel,
                ]}
              </Text>
              <Text testID="previsao-ia-confianca" style={styles.previsaoConfianca}>
                {['Confiança do modelo: ', trecho.previsaoIA.confianca + '%']}
              </Text>
              <Text testID="previsao-ia-motivo" style={styles.previsaoMotivo}>
                {trecho.previsaoIA.motivo}
              </Text>

              {trecho.previsaoIA.fatores?.length ? (
                <View testID="previsao-ia-fatores" style={styles.fatores}>
                  <Text style={styles.fatoresTitulo}>
                    Como o modelo chegou nesta nota ({trecho.previsaoIA.score}/100):
                  </Text>
                  {trecho.previsaoIA.fatores.map((fator, i) => (
                    <View key={i} style={styles.fatorLinha}>
                      <Text style={styles.fatorTexto}>{fator.descricao}</Text>
                      <Text style={[styles.fatorPontos, fator.pontos < 0 && styles.fatorNegativo]}>
                        {(fator.pontos > 0 ? '+' : '') + fator.pontos}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          </Card>
        ) : null}

        <Card title="Feedback da poda">
          <View style={styles.blocoConteudo}>
            <Text style={styles.feedbackQuestion}>Você realizou a poda neste trecho?</Text>
            <View style={styles.statusOptions}>
              <Escolha
                testID="feedback-poda-sim"
                label="Sim"
                selecionado={podaRealizada === true}
                onPress={() => setPodaRealizada(true)}
              />
              <Escolha
                testID="feedback-poda-nao"
                label="Não"
                selecionado={podaRealizada === false}
                onPress={() => setPodaRealizada(false)}
              />
            </View>

            <Text style={styles.feedbackQuestion}>A previsão de IA acertou o nível de urgência?</Text>
            <View style={styles.statusOptions}>
              <Escolha
                testID="feedback-previsao-sim"
                label="Sim"
                selecionado={previsaoCorreta === true}
                onPress={() => setPrevisaoCorreta(true)}
              />
              <Escolha
                testID="feedback-previsao-nao"
                label="Não"
                selecionado={previsaoCorreta === false}
                onPress={() => setPrevisaoCorreta(false)}
              />
            </View>

            <PrimaryButton
              testID="salvar-feedback-button"
              label="SALVAR FEEDBACK"
              onPress={handleSalvarFeedback}
              loading={salvandoFeedback}
            />

            {mensagemFeedback ? (
              <InlineMessage testID="feedback-mensagem" {...mensagemFeedback} />
            ) : null}

            {feedbackSalvoEm ? (
              <Text testID="feedback-confirmacao" style={styles.feedbackConfirmacao}>
                Feedback registrado em {feedbackSalvoEm}
              </Text>
            ) : null}
          </View>
        </Card>

        <Card title="Registrar inspeção">
          <View style={styles.blocoConteudo}>
            <View style={styles.statusOptions}>
              {STATUS_VEGETACAO_OPTIONS.map((option) => (
                <Escolha
                  key={option.key}
                  testID={'status-option-' + option.key}
                  label={option.emoji + ' ' + option.value}
                  selecionado={statusSelecionado === option.value}
                  onPress={() => setStatusSelecionado(option.value)}
                />
              ))}
            </View>

            <FormInput
              testID="observacao-input"
              placeholder="Descreva a observação da inspeção"
              value={observacao}
              onChangeText={setObservacao}
              multiline
              style={styles.inputEspaco}
              accessibilityLabel="Observação da inspeção"
            />

            <View style={styles.fotoBotoes}>
              <PrimaryButton
                testID="foto-camera-button"
                label="📷 CÂMERA"
                variant="secondary"
                onPress={() => anexarFoto('camera')}
                style={styles.fotoBotao}
              />
              <PrimaryButton
                testID="foto-galeria-button"
                label="🖼️ GALERIA"
                variant="secondary"
                onPress={() => anexarFoto('galeria')}
                style={styles.fotoBotao}
              />
            </View>
            {mensagemFoto ? <InlineMessage testID="foto-mensagem" {...mensagemFoto} /> : null}
            {foto ? (
              <View testID="foto-preview" style={styles.fotoPreview}>
                <Image source={{ uri: foto }} style={styles.fotoImagem} accessibilityLabel="Foto anexada à inspeção" />
                <TouchableOpacity
                  testID="foto-remover"
                  onPress={() => setFoto(null)}
                  accessibilityRole="button"
                  accessibilityLabel="Remover foto"
                >
                  <Text style={styles.fotoRemover}>Remover foto</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <PrimaryButton
              testID="registrar-inspecao-button"
              label="REGISTRAR INSPEÇÃO"
              onPress={handleRegistrarInspecao}
              loading={salvandoInspecao}
            />

            {mensagemInspecao ? (
              <InlineMessage testID="inspecao-mensagem" {...mensagemInspecao} />
            ) : null}
          </View>
        </Card>

        <Card title="Histórico de inspeções">
          <View style={styles.blocoConteudo}>
            {trecho.historico.length === 0 ? (
              <StateView
                testID="historico-vazio"
                variant="empty"
                title="Nenhuma inspeção registrada"
                message="Registre a primeira inspeção deste trecho no formulário acima."
              />
            ) : (
              trecho.historico.map((item, index) => (
                <View
                  key={item.data + '-' + index}
                  testID={'historico-item-' + index}
                  style={styles.historicoItem}
                >
                  <Text style={styles.historicoData}>
                    {formatarDataCurta(item.data)} — {item.status}
                  </Text>
                  <Text style={styles.historicoObs}>{item.observacao}</Text>
                  {item.foto ? (
                    <Image
                      testID={'historico-foto-' + index}
                      source={{ uri: item.foto }}
                      style={styles.historicoFoto}
                      accessibilityLabel={'Foto da inspeção de ' + formatarDataCurta(item.data)}
                    />
                  ) : null}
                  <Text style={styles.historicoTecnico}>{item.tecnico}</Text>
                </View>
              ))
            )}
          </View>
        </Card>
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
  cardTopo: {
    marginTop: 16,
  },
  blocoConteudo: {
    marginTop: 12,
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
    justifyContent: 'center',
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
  inputEspaco: {
    marginBottom: 12,
  },
  mapaBotao: {
    marginTop: 12,
  },
  fatores: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    paddingTop: 10,
  },
  fatoresTitulo: {
    color: colors.textLabel,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  fatorLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 3,
  },
  fatorTexto: {
    color: colors.textMuted,
    fontSize: 12,
    flex: 1,
    marginRight: 8,
  },
  fatorPontos: {
    color: colors.error,
    fontSize: 12,
    fontWeight: 'bold',
  },
  fatorNegativo: {
    color: colors.primary,
  },
  fotoBotoes: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  fotoBotao: {
    flex: 1,
  },
  fotoPreview: {
    alignItems: 'center',
    marginBottom: 12,
  },
  fotoImagem: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  fotoRemover: {
    color: colors.error,
    fontSize: 12,
    marginTop: 8,
  },
  historicoFoto: {
    width: '100%',
    height: 140,
    borderRadius: 6,
    marginTop: 8,
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
