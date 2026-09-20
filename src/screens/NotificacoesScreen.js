import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';
import StateView from '../components/StateView';
import StatusBadge from '../components/StatusBadge';
import PrimaryButton from '../components/PrimaryButton';
import InlineMessage from '../components/InlineMessage';
import NotificacoesService from '../services/NotificacoesService';
import { NOTIFICACAO_TIPO_INFO } from '../mocks/notificacoesMock';

export default function NotificacoesScreen() {
  const navigation = useNavigation();
  const [notificacoes, setNotificacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState(null);
  const [aviso, setAviso] = useState(null);

  const carregar = useCallback(async ({ refresh = false } = {}) => {
    if (refresh) {
      setAtualizando(true);
    } else {
      setCarregando(true);
    }
    setErro(null);

    try {
      const lista = await NotificacoesService.getNotificacoes();
      setNotificacoes(lista);
    } catch (e) {
      setErro(e.message);
      setNotificacoes([]);
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  React.useEffect(() => {
    carregar();
  }, [carregar]);

  async function abrirNotificacao(notificacao) {
    const lista = await NotificacoesService.marcarComoLida(notificacao.id);
    setNotificacoes(lista);

    if (notificacao.trechoId) {
      navigation.navigate('TrechoDetail', { trechoId: notificacao.trechoId });
    }
  }

  async function marcarTodas() {
    setAviso(null);
    try {
      const lista = await NotificacoesService.marcarTodasComoLidas();
      setNotificacoes(lista);
      setAviso({ type: 'success', text: 'Todas as notificações foram marcadas como lidas.' });
    } catch (e) {
      setAviso({ type: 'error', text: e.message });
    }
  }

  const naoLidas = notificacoes.filter((item) => !item.lida).length;

  function renderConteudo() {
    if (carregando) {
      return (
        <StateView
          testID="notificacoes-loading"
          variant="loading"
          message="Carregando notificações..."
        />
      );
    }

    if (erro) {
      return (
        <StateView
          testID="notificacoes-erro"
          variant="error"
          title="Não foi possível carregar as notificações"
          message={erro}
          actionLabel="TENTAR NOVAMENTE"
          onAction={() => carregar()}
        />
      );
    }

    if (notificacoes.length === 0) {
      return (
        <StateView
          testID="notificacoes-vazio"
          variant="empty"
          title="Nenhuma notificação por aqui"
          message="Quando a supervisão ou o modelo de IA enviarem um alerta, ele aparece nesta tela."
        />
      );
    }

    return (
      <>
        {naoLidas > 0 ? (
          <PrimaryButton
            testID="marcar-todas-button"
            label="MARCAR TODAS COMO LIDAS"
            onPress={marcarTodas}
            variant="secondary"
            style={styles.marcarTodas}
          />
        ) : null}

        {aviso ? <InlineMessage testID="notificacoes-aviso" {...aviso} /> : null}

        {notificacoes.map((item) => {
          const tipo = NOTIFICACAO_TIPO_INFO[item.tipo] || NOTIFICACAO_TIPO_INFO.sistema;
          return (
            <TouchableOpacity
              key={item.id}
              testID={'notificacao-' + item.id}
              style={[styles.card, !item.lida && styles.cardNaoLida]}
              onPress={() => abrirNotificacao(item)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <StatusBadge label={tipo.emoji + ' ' + tipo.label} color={tipo.color} />
                {!item.lida ? <View testID={'nao-lida-' + item.id} style={styles.pontoNaoLida} /> : null}
              </View>
              <Text style={styles.cardTitulo}>{item.titulo}</Text>
              <Text style={styles.cardMensagem}>{item.mensagem}</Text>
              <Text style={styles.cardData}>{item.data}</Text>
              {item.trechoId ? <Text style={styles.cardLink}>Abrir trecho relacionado ›</Text> : null}
            </TouchableOpacity>
          );
        })}
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
          title="Notificações"
          subtitle={
            carregando || erro
              ? 'Alertas operacionais e do modelo de IA'
              : naoLidas + ' não lida(s) de ' + notificacoes.length
          }
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
  marcarTodas: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  cardNaoLida: {
    borderLeftColor: colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pontoNaoLida: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  cardTitulo: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  cardMensagem: {
    color: colors.textLabel,
    fontSize: 12,
    marginTop: 6,
    lineHeight: 18,
  },
  cardData: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 8,
  },
  cardLink: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 8,
  },
});
