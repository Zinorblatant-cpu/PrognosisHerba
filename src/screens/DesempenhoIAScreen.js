import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import StateView from '../components/StateView';
import StatusBadge from '../components/StatusBadge';
import DesempenhoIAService from '../services/DesempenhoIAService';
import { PREVISAO_IA_INFO } from '../constants/previsaoIA';
import { formatarDataCurta } from '../utils/datas';
import {
  LIMIAR_URGENTE,
  LIMIAR_ATENCAO,
  PESO_STATUS,
  TAXA_CRESCIMENTO,
  PESO_PIORA,
  PESO_RISCO_SEGURANCA,
  PESO_PODA_RECENTE,
} from '../services/PrevisaoIAService';

// Sprint 4 (P3/P6): consolida o feedback dos podadores e mostra o quanto o
// modelo de previsão está acertando — o ciclo de avaliação que ficou aberto
// na Sprint 3.

function corDaTaxa(taxa) {
  if (taxa === null) return colors.textMuted;
  if (taxa >= 75) return colors.primary;
  if (taxa >= 50) return '#FFD000';
  return colors.error;
}

function Barra({ valor }) {
  const largura = valor === null ? 0 : Math.max(4, valor);
  return (
    <View style={styles.barraFundo}>
      <View style={[styles.barraValor, { width: largura + '%', backgroundColor: corDaTaxa(valor) }]} />
    </View>
  );
}

export default function DesempenhoIAScreen() {
  const navigation = useNavigation();
  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async ({ refresh = false } = {}) => {
    if (refresh) setAtualizando(true);
    else setCarregando(true);
    setErro(null);

    try {
      setResumo(await DesempenhoIAService.getResumo());
    } catch (e) {
      setErro(e.message);
      setResumo(null);
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  function renderConteudo() {
    if (carregando) {
      return (
        <StateView
          testID="desempenho-loading"
          variant="loading"
          message="Calculando o desempenho do modelo..."
        />
      );
    }

    if (erro) {
      return (
        <StateView
          testID="desempenho-erro"
          variant="error"
          title="Não foi possível carregar o desempenho"
          message={erro}
          actionLabel="TENTAR NOVAMENTE"
          onAction={() => carregar()}
        />
      );
    }

    if (!resumo || resumo.total === 0) {
      return (
        <StateView
          testID="desempenho-vazio"
          variant="empty"
          title="Nenhum feedback registrado ainda"
          message="Depois de cada poda, responda no detalhe do trecho se a previsão de IA acertou. As respostas aparecem aqui."
          actionLabel="IR PARA OS TRECHOS"
          onAction={() => navigation.navigate('Trechos')}
        />
      );
    }

    return (
      <>
        <Card testID="desempenho-resumo">
          <Text style={styles.rotuloGrande}>Taxa de acerto do modelo</Text>
          <Text testID="desempenho-taxa" style={[styles.taxaGrande, { color: corDaTaxa(resumo.taxaAcerto) }]}>
            {resumo.taxaAcerto + '%'}
          </Text>
          <Text testID="desempenho-contagem" style={[styles.textoSecundario, styles.centro]}>
            {resumo.acertos + ' de ' + resumo.total + ' previsões confirmadas pelos podadores'}
          </Text>
          {resumo.registradosNoApp > 0 ? (
            <Text testID="desempenho-seus" style={styles.destaque}>
              {resumo.registradosNoApp +
                (resumo.registradosNoApp === 1 ? ' feedback seu' : ' feedbacks seus') +
                ' já entraram no cálculo'}
            </Text>
          ) : null}
        </Card>

        <Card title="Acerto por nível previsto">
          <View style={styles.bloco}>
            {resumo.porNivel.map((item) => (
              <View key={item.nivel} testID={'desempenho-nivel-' + item.nivel} style={styles.linhaNivel}>
                <View style={styles.linhaTopo}>
                  <Text style={styles.textoLinha}>
                    {(PREVISAO_IA_INFO[item.nivel]?.emoji || '') + ' ' + item.nivel}
                  </Text>
                  <Text style={styles.valorLinha}>
                    {item.taxa === null
                      ? 'sem dados'
                      : item.taxa + '% (' + item.acertos + '/' + item.total + ')'}
                  </Text>
                </View>
                <Barra valor={item.taxa} />
              </View>
            ))}
          </View>
        </Card>

        <Card title="Por trecho" subtitle="Toque para abrir o trecho">
          <View style={styles.bloco}>
            {resumo.porTrecho.map((item) => {
              const info = PREVISAO_IA_INFO[item.nivelAtual];
              return (
                <TouchableOpacity
                  key={item.trechoId}
                  testID={'desempenho-trecho-' + item.trechoId}
                  style={styles.linhaTrecho}
                  onPress={() => navigation.navigate('TrechoDetail', { trechoId: item.trechoId })}
                  accessibilityRole="button"
                  accessibilityLabel={'Abrir ' + item.nomeTrecho}
                >
                  <View style={styles.trechoTexto}>
                    <Text style={styles.textoLinha}>{item.nomeTrecho}</Text>
                    <Text style={styles.textoSecundario}>
                      {item.total === 0
                        ? 'Sem feedback ainda'
                        : item.acertos +
                          ' de ' +
                          item.total +
                          ' acertos' +
                          (item.ultimo ? ' • último em ' + formatarDataCurta(item.ultimo.data) : '')}
                    </Text>
                  </View>
                  {info ? (
                    <StatusBadge label={info.emoji + ' ' + item.nivelAtual} color={info.color} />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        <Card title="Feedbacks recentes">
          <View style={styles.bloco}>
            {resumo.recentes.map((item) => (
              <View key={item.id} testID={'desempenho-recente-' + item.id} style={styles.linhaRecente}>
                <Text style={styles.icone}>{item.previsaoCorreta ? '✅' : '❌'}</Text>
                <View style={styles.trechoTexto}>
                  <Text style={styles.textoLinha}>
                    {'IA previu ' +
                      (item.nivelPrevisto || '—') +
                      (item.previsaoCorreta ? ' — acertou' : ' — errou')}
                  </Text>
                  <Text style={styles.textoSecundario}>
                    {formatarDataCurta(item.data) + ' • ' + item.tecnico}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        <Card title="Como a previsão é calculada" subtitle="Modelo de pontuação explicável, de 0 a 100">
          <View style={styles.bloco}>
            <Text style={styles.textoSecundario}>
              {'• Status da última inspeção: Crítico +' +
                PESO_STATUS['Crítico'] +
                ', Atenção +' +
                PESO_STATUS['Atenção'] +
                ', Conforme +' +
                PESO_STATUS['Conforme']}
            </Text>
            <Text style={styles.textoSecundario}>
              {'• Dias sem inspeção: +' +
                TAXA_CRESCIMENTO.chuvoso.toFixed(1).replace('.', ',') +
                '/dia no período chuvoso (out–mar), +' +
                TAXA_CRESCIMENTO.seco.toFixed(1).replace('.', ',') +
                '/dia no seco'}
            </Text>
            <Text style={styles.textoSecundario}>{'• Piora entre inspeções: +' + PESO_PIORA}</Text>
            <Text style={styles.textoSecundario}>
              {'• Risco à sinalização ou visibilidade: +' + PESO_RISCO_SEGURANCA}
            </Text>
            <Text style={styles.textoSecundario}>{'• Poda recém-executada: ' + PESO_PODA_RECENTE}</Text>
            <Text style={[styles.textoSecundario, styles.limiares]}>
              {'Urgente a partir de ' + LIMIAR_URGENTE + ' • Atenção a partir de ' + LIMIAR_ATENCAO}
            </Text>
            <Text style={[styles.textoSecundario, styles.limiares]}>
              Os feedbacks desta tela são o conjunto de dados que vai treinar o modelo de machine learning da
              próxima versão, integrada ao backend da Motiva.
            </Text>
          </View>
        </Card>
      </>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={() => carregar({ refresh: true })}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <ScreenHeader
          title="Desempenho da IA"
          subtitle="Acerto das previsões, segundo o feedback dos podadores"
          onBack={() => navigation.goBack()}
        />
        {renderConteudo()}
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
  bloco: {
    marginTop: 10,
  },
  rotuloGrande: {
    color: colors.textLabel,
    fontSize: 13,
    textAlign: 'center',
  },
  taxaGrande: {
    fontSize: 44,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 4,
  },
  destaque: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
  },
  textoSecundario: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },
  textoLinha: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  valorLinha: {
    color: colors.textLabel,
    fontSize: 12,
  },
  linhaNivel: {
    marginBottom: 12,
  },
  linhaTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  barraFundo: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  barraValor: {
    height: 8,
    borderRadius: 4,
  },
  linhaTrecho: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  trechoTexto: {
    flex: 1,
    marginRight: 8,
  },
  linhaRecente: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  icone: {
    fontSize: 16,
    marginRight: 10,
  },
  centro: {
    textAlign: 'center',
  },
  limiares: {
    marginTop: 8,
  },
});
