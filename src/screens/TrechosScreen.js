import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';
import StateView from '../components/StateView';
import StatusBadge from '../components/StatusBadge';
import FilterChips from '../components/FilterChips';
import TrechosService from '../services/TrechosService';
import LocationService from '../services/LocationService';
import { PREVISAO_IA_INFO, getPrioridadeIA } from '../constants/previsaoIA';
import { getStatusInfo } from '../constants/statusVegetacao';

const FILTROS = [
  { id: 'todos', label: 'Todos' },
  { id: 'Crítico', label: '🔴 Crítico' },
  { id: 'Atenção', label: '🟡 Atenção' },
  { id: 'Conforme', label: '🟢 Conforme' },
];

function ordenarPorPrioridade(trechos, location) {
  return [...trechos].sort((a, b) => {
    const diff = getPrioridadeIA(b.previsaoIA?.nivel) - getPrioridadeIA(a.previsaoIA?.nivel);
    if (diff !== 0 || !location) return diff;

    const distA = LocationService.getDistanceKm(location, { latitude: a.latitude, longitude: a.longitude });
    const distB = LocationService.getDistanceKm(location, { latitude: b.latitude, longitude: b.longitude });
    return distA - distB;
  });
}

export default function TrechosScreen() {
  const navigation = useNavigation();
  const [trechos, setTrechos] = useState([]);
  const [location, setLocation] = useState(null);
  const [nearestId, setNearestId] = useState(null);
  const [filtro, setFiltro] = useState('todos');
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
      const trechosData = await TrechosService.getTrechos();
      const position = await LocationService.getCurrentPosition();

      setTrechos(trechosData);
      setLocation(position);

      if (position && trechosData.length > 0) {
        let closest = null;
        let closestDistance = Infinity;
        trechosData.forEach((trecho) => {
          const distance = LocationService.getDistanceKm(position, {
            latitude: trecho.latitude,
            longitude: trecho.longitude,
          });
          if (distance < closestDistance) {
            closestDistance = distance;
            closest = trecho.id;
          }
        });
        setNearestId(closest);
      } else {
        setNearestId(null);
      }
    } catch (e) {
      setErro(e.message);
      setTrechos([]);
      setNearestId(null);
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  // Recarrega sempre que a tela volta ao foco, para que uma inspeção registrada
  // no detalhe apareça imediatamente na lista ao voltar.
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const ordenados = ordenarPorPrioridade(trechos, location);
  const visiveis = filtro === 'todos' ? ordenados : ordenados.filter((t) => t.statusVegetacao === filtro);

  function renderLista() {
    if (carregando) {
      return (
        <StateView testID="trechos-loading" variant="loading" message="Carregando os trechos monitorados..." />
      );
    }

    if (erro) {
      return (
        <StateView
          testID="trechos-erro"
          variant="error"
          title="Não foi possível carregar os trechos"
          message={erro}
          actionLabel="TENTAR NOVAMENTE"
          onAction={() => carregar()}
        />
      );
    }

    if (trechos.length === 0) {
      return (
        <StateView
          testID="trechos-vazio"
          variant="empty"
          title="Nenhum trecho monitorado"
          message="Ainda não há trechos atribuídos à sua equipe. Assim que a supervisão liberar a escala, eles aparecem aqui."
        />
      );
    }

    if (visiveis.length === 0) {
      return (
        <StateView
          testID="trechos-filtro-vazio"
          variant="empty"
          title="Nenhum trecho com esse status"
          message="Nenhum dos trechos monitorados está nessa classificação no momento."
          actionLabel="LIMPAR FILTRO"
          onAction={() => setFiltro('todos')}
        />
      );
    }

    return visiveis.map((trecho) => {
      const status = getStatusInfo(trecho.statusVegetacao);
      const previsao = PREVISAO_IA_INFO[trecho.previsaoIA?.nivel] || PREVISAO_IA_INFO['Não necessária'];

      return (
        <TouchableOpacity
          key={trecho.id}
          testID={'trecho-item-' + trecho.id}
          style={styles.card}
          onPress={() => navigation.navigate('TrechoDetail', { trechoId: trecho.id })}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{trecho.nomeTrecho}</Text>
            <StatusBadge
              testID={'status-badge-' + trecho.id}
              label={status.emoji + ' ' + trecho.statusVegetacao}
              color={status.color}
            />
          </View>
          <Text style={styles.cardSub}>{trecho.rodovia}</Text>
          <Text style={styles.cardSub}>{trecho.km}</Text>
          <Text style={styles.cardDate}>Última inspeção: {trecho.ultimaInspecao}</Text>

          {trecho.previsaoIA ? (
            <StatusBadge
              testID={'previsao-badge-' + trecho.id}
              color={previsao.color}
              style={styles.previsaoBadge}
              label={[
                '🤖 IA: ',
                previsao.emoji + ' ' + trecho.previsaoIA.nivel,
                ' • ' + trecho.previsaoIA.confianca + '% de confiança',
              ]}
            />
          ) : null}

          {nearestId === trecho.id ? (
            <Text testID={'trecho-mais-proximo-' + trecho.id} style={styles.nearestTag}>
              📍 Mais próximo de você
            </Text>
          ) : null}
        </TouchableOpacity>
      );
    });
  }

  const mostrarFiltros = !carregando && !erro && trechos.length > 0;

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
          title="Trechos da Rodovia"
          subtitle={mostrarFiltros ? visiveis.length + ' de ' + trechos.length + ' trechos exibidos' : null}
          onBack={() => navigation.goBack()}
        />

        <View style={styles.iaBanner}>
          <Text style={styles.iaTitle}>🤖 Previsão de IA — Necessidade de Poda</Text>
          <Text style={styles.iaSubtitle}>
            Trechos ordenados por prioridade, do mais urgente para o desnecessário.
          </Text>
          <Text testID="previsao-legenda" style={styles.iaLegenda}>
            {PREVISAO_IA_INFO['Urgente'].emoji +
              ' Urgente   ' +
              PREVISAO_IA_INFO['Atenção'].emoji +
              ' Atenção   ' +
              PREVISAO_IA_INFO['Não necessária'].emoji +
              ' Não necessária'}
          </Text>
        </View>

        <Text testID="location-info" style={styles.locationInfo}>
          {location
            ? '📍 Sua localização: ' + location.latitude.toFixed(4) + ', ' + location.longitude.toFixed(4)
            : '📍 Localização indisponível'}
        </Text>

        {mostrarFiltros ? (
          <FilterChips options={FILTROS} value={filtro} onChange={setFiltro} testIDPrefix="filtro-status" />
        ) : null}

        {renderLista()}
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
  locationInfo: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 16,
  },
  iaBanner: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  iaTitle: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  iaSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  iaLegenda: {
    color: colors.textLabel,
    fontSize: 11,
    marginTop: 8,
  },
  previsaoBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  cardSub: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  cardDate: {
    color: colors.textLabel,
    fontSize: 11,
    marginTop: 6,
  },
  nearestTag: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 8,
  },
});
