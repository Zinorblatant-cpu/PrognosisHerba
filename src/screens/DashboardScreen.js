import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import AuthService from '../services/AuthService';

const WEEKLY_ITEMS = [
  { id: 'days', icon: '📅', label: 'Poda em quantos dias', value: '3 dias programados' },
  { id: 'local', icon: '📍', label: 'Local da poda', value: '1 localização definidos' },
  { id: 'hora', icon: '🕐', label: 'Hora da poda', value: '09:00h - 17:00h' },
];

export default function DashboardScreen() {
  const navigation = useNavigation();

  async function handleLogout() {
    await AuthService.clearUser();
    navigation.navigate('Register');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, João!</Text>
            <Text style={styles.subGreeting}>Confira suas atividades 🌱</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity testID="notification-bell" accessibilityLabel="notificações">
              <Text style={styles.bell}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="logout-button"
              onPress={handleLogout}
              style={styles.logoutBtn}
              accessibilityLabel="sair"
            >
              <Text style={styles.logoutText}>Sair</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Atividades do Dia */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Atividades do Dia</Text>
            <Text style={styles.sectionDate}>Terça-feira, 27 de maio</Text>
          </View>

          <View style={styles.activityCard}>
            <View style={[styles.activityIcon, { backgroundColor: '#1A3300' }]}>
              <Text>✂️</Text>
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityLabel}>Poda</Text>
              <Text style={styles.activitySub}>Horário seleção</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </View>

          <View style={styles.activityCard}>
            <View style={[styles.activityIcon, { backgroundColor: '#330000' }]}>
              <Text>🚫</Text>
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityLabel}>Não Poda</Text>
              <Text style={styles.activitySub}>Informe sua ausência</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </View>
        </View>

        {/* Atividades da Semana */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Atividades da Semana</Text>
              <Text style={styles.sectionDate}>27 a 29 de maio</Text>
            </View>
            <TouchableOpacity testID="ver-calendario">
              <Text style={styles.linkText}>Ver calendário</Text>
            </TouchableOpacity>
          </View>

          {WEEKLY_ITEMS.map((item) => (
            <TouchableOpacity key={item.id} style={styles.weeklyItem}>
              <Text style={styles.weeklyIcon}>{item.icon}</Text>
              <View style={styles.weeklyInfo}>
                <Text style={styles.weeklyLabel}>{item.label}</Text>
                <Text style={styles.weeklyValue}>{item.value}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Resumo da Semana */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo da semana</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>📋</Text>
              <Text testID="stat-dias" style={styles.summaryNumber}>3</Text>
              <Text style={styles.summaryLabel}>Dias de poda</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>📍</Text>
              <Text testID="stat-locais" style={styles.summaryNumber}>5</Text>
              <Text style={styles.summaryLabel}>locais</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>🕐</Text>
              <Text testID="stat-horario" style={styles.summaryNumber}>09:00</Text>
              <Text style={styles.summaryLabel}>horário de início</Text>
            </View>
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  subGreeting: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bell: {
    fontSize: 22,
    color: colors.text,
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  logoutText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  sectionDate: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  activitySub: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  arrow: {
    color: colors.textMuted,
    fontSize: 20,
  },
  linkText: {
    color: colors.primary,
    fontSize: 12,
  },
  weeklyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  weeklyIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  weeklyInfo: {
    flex: 1,
  },
  weeklyLabel: {
    color: colors.text,
    fontSize: 13,
  },
  weeklyValue: {
    color: colors.primary,
    fontSize: 11,
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  summaryNumber: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
  },
});
