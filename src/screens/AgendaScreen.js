import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';
import StateView from '../components/StateView';
import StatusBadge from '../components/StatusBadge';
import AgendaService from '../services/AgendaService';
import { AGENDA_STATUS_INFO, DATA_REFERENCIA } from '../mocks/agendaMock';

const STATUS_FALLBACK = { emoji: '🗓️', color: '#00294D' };

export default function AgendaScreen() {
  const navigation = useNavigation();
  const [dias, setDias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async ({ refresh = false } = {}) => {
    if (refresh) {
      setAtualizando(true);
    } else {
      setCarregando(true);
    }
    setErro(null);

    try {
      const semana = await AgendaService.getAgendaSemana();
      setDias(semana);
    } catch (e) {
      setErro(e.message);
      setDias([]);
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function renderConteudo() {
    if (carregando) {
      return <StateView testID="agenda-loading" variant="loading" message="Carregando sua escala..." />;
    }

    if (erro) {
      return (
        <StateView
          testID="agenda-erro"
          variant="error"
          title="Não foi possível carregar a agenda"
          message={erro}
          actionLabel="TENTAR NOVAMENTE"
          onAction={() => carregar()}
        />
      );
    }

    if (dias.length === 0) {
      return (
        <StateView
          testID="agenda-vazio"
          variant="empty"
          title="Nenhuma diária programada"
          message="A escala desta semana ainda não foi publicada pela supervisão."
        />
      );
    }

    return dias.map((dia) => {
      const info = AGENDA_STATUS_INFO[dia.status] || STATUS_FALLBACK;
      const hoje = dia.data === DATA_REFERENCIA.hoje;

      return (
        <View key={dia.id} testID={'agenda-dia-' + dia.id} style={[styles.card, hoje && styles.cardHoje]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderText}>
              <Text style={styles.diaSemana}>{dia.diaSemana}</Text>
              <Text style={styles.diaLabel}>{dia.diaLabel}</Text>
            </View>
            <StatusBadge
              testID={'agenda-status-' + dia.id}
              label={info.emoji + ' ' + dia.status}
              color={info.color}
            />
          </View>

          {hoje ? <Text style={styles.tagHoje}>HOJE</Text> : null}

          <Text style={styles.linha}>🕐 {dia.turno}</Text>
          <Text style={styles.linha}>👷 {dia.equipe}</Text>
          <Text style={styles.local}>{dia.trecho}</Text>
          <Text style={styles.rodovia}>{dia.rodovia}</Text>
          <Text style={styles.descricao}>{dia.descricao}</Text>

          {dia.registradoEm ? (
            <Text style={styles.registro}>Registrado pelo operador em {dia.registradoEm}</Text>
          ) : null}

          {dia.trechoId ? (
            <TouchableOpacity
              testID={'agenda-abrir-' + dia.id}
              onPress={() => navigation.navigate('TrechoDetail', { trechoId: dia.trechoId })}
              activeOpacity={0.8}
            >
              <Text style={styles.link}>Ver detalhe do trecho ›</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      );
    });
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
          title="Agenda da Semana"
          subtitle={DATA_REFERENCIA.intervaloSemana + ' • Equipe Alfa'}
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
  card: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardHoje: {
    borderColor: colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardHeaderText: {
    flex: 1,
    marginRight: 8,
  },
  diaSemana: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  diaLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  tagHoje: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginTop: 8,
  },
  linha: {
    color: colors.textLabel,
    fontSize: 12,
    marginTop: 6,
  },
  local: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
  },
  rodovia: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  descricao: {
    color: colors.textLabel,
    fontSize: 12,
    marginTop: 8,
    lineHeight: 18,
  },
  registro: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 8,
  },
  link: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 10,
  },
});
