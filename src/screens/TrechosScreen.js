import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import TrechosService from '../services/TrechosService';
import LocationService from '../services/LocationService';
import { PREVISAO_IA_INFO, getPrioridadeIA } from '../constants/previsaoIA';

const STATUS_INFO = {
  Conforme: { emoji: '🟢', color: '#1A3300' },
  Atenção: { emoji: '🟡', color: '#332B00' },
  Crítico: { emoji: '🔴', color: '#330000' },
};

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

  useEffect(() => {
    let isMounted = true;

    async function load() {
      const trechosData = await TrechosService.getTrechos();
      const position = await LocationService.getCurrentPosition();

      if (!isMounted) return;

      setTrechos(trechosData);
      setLocation(position);

      if (position) {
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
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

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

        <Text style={styles.title}>Trechos da Rodovia</Text>

        <View style={styles.iaBanner}>
          <Text style={styles.iaTitle}>🤖 Previsão de IA — Necessidade de Poda</Text>
          <Text style={styles.iaSubtitle}>
            Trechos ordenados por prioridade, do mais urgente para o desnecessário.
          </Text>
          <Text testID="previsao-legenda" style={styles.iaLegenda}>
            {`${PREVISAO_IA_INFO['Urgente'].emoji} Urgente   ${PREVISAO_IA_INFO['Atenção'].emoji} Atenção   ${PREVISAO_IA_INFO['Não necessária'].emoji} Não necessária`}
          </Text>
        </View>

        <Text testID="location-info" style={styles.locationInfo}>
          {location
            ? `📍 Sua localização: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
            : '📍 Localização indisponível'}
        </Text>

        {ordenarPorPrioridade(trechos, location).map((trecho) => {
          const status = STATUS_INFO[trecho.statusVegetacao] || STATUS_INFO.Conforme;
          const previsao = PREVISAO_IA_INFO[trecho.previsaoIA?.nivel] || PREVISAO_IA_INFO['Não necessária'];
          return (
            <TouchableOpacity
              key={trecho.id}
              testID={`trecho-item-${trecho.id}`}
              style={styles.card}
              onPress={() => navigation.navigate('TrechoDetail', { trechoId: trecho.id })}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{trecho.nomeTrecho}</Text>
                <Text testID={`status-badge-${trecho.id}`} style={[styles.statusBadge, { backgroundColor: status.color }]}>
                  {`${status.emoji} ${trecho.statusVegetacao}`}
                </Text>
              </View>
              <Text style={styles.cardSub}>{trecho.rodovia}</Text>
              <Text style={styles.cardSub}>{trecho.km}</Text>
              <Text style={styles.cardDate}>Última inspeção: {trecho.ultimaInspecao}</Text>
              {trecho.previsaoIA && (
                <Text
                  testID={`previsao-badge-${trecho.id}`}
                  style={[styles.previsaoBadge, { backgroundColor: previsao.color }]}
                >
                  {['🤖 IA: ', `${previsao.emoji} ${trecho.previsaoIA.nivel}`, ` • ${trecho.previsaoIA.confianca}% de confiança`]}
                </Text>
              )}
              {nearestId === trecho.id && (
                <Text testID={`trecho-mais-proximo-${trecho.id}`} style={styles.nearestTag}>
                  📍 Mais próximo de você
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
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
    marginBottom: 12,
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
    color: colors.text,
    fontSize: 11,
    fontWeight: '600',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
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
  statusBadge: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '600',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
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
