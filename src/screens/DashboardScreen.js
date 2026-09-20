import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import Card from '../components/Card';
import AuthService from '../services/AuthService';
import AgendaService from '../services/AgendaService';
import NotificacoesService from '../services/NotificacoesService';
import { USUARIO_MOCK, getPrimeiroNome } from '../mocks/usuarioMock';
import { DATA_REFERENCIA } from '../mocks/agendaMock';

export default function DashboardScreen() {
  const navigation = useNavigation();

  // Conteúdo estático da agenda vem do service (camada de mock), não do
  // componente — quando houver API, só o service muda.
  const atividadesDia = AgendaService.getAtividadesDia();
  const itensSemana = AgendaService.getItensSemana();
  const resumoSemana = AgendaService.getResumoSemana();

  const [primeiroNome, setPrimeiroNome] = useState(getPrimeiroNome(USUARIO_MOCK.nome));
  const [naoLidas, setNaoLidas] = useState(0);
  const [registroDoDia, setRegistroDoDia] = useState(null);

  // Recarrega ao voltar para o Dashboard: o badge de notificações e o status do
  // dia precisam refletir o que foi feito nas outras telas.
  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      AuthService.getPerfil().then((perfil) => {
        if (ativo && perfil) setPrimeiroNome(getPrimeiroNome(perfil.nome));
      });
      NotificacoesService.contarNaoLidas().then((total) => {
        if (ativo) setNaoLidas(total);
      });
      AgendaService.getRegistroDoDia().then((registro) => {
        if (ativo) setRegistroDoDia(registro);
      });

      return () => {
        ativo = false;
      };
    }, [])
  );

  async function handleLogout() {
    await AuthService.clearUser();
    navigation.reset({ index: 0, routes: [{ name: 'Register' }] });
  }

  function statusDoCard(tipo) {
    if (!registroDoDia) return null;
    if (registroDoDia.tipo !== tipo) return null;
    return tipo === 'poda'
      ? 'Confirmada • ' + registroDoDia.turnoHorario
      : 'Registrada • ' + registroDoDia.motivoLabel;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {primeiroNome}!</Text>
            <Text style={styles.subGreeting}>Confira suas atividades 🌱</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              testID="notification-bell"
              accessibilityRole="button"
              accessibilityLabel="notificações"
              onPress={() => navigation.navigate('Notificacoes')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.bell}>🔔</Text>
              {naoLidas > 0 ? (
                <View testID="notification-badge" style={styles.badge}>
                  <Text style={styles.badgeText}>{String(naoLidas)}</Text>
                </View>
              ) : null}
            </TouchableOpacity>

            <TouchableOpacity
              testID="perfil-button"
              accessibilityRole="button"
              accessibilityLabel="perfil"
              onPress={() => navigation.navigate('Perfil')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.bell}>👤</Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="logout-button"
              onPress={handleLogout}
              style={styles.logoutBtn}
              accessibilityRole="button"
              accessibilityLabel="sair"
            >
              <Text style={styles.logoutText}>Sair</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Atividades do Dia */}
        <Card title="Atividades do Dia" subtitle={DATA_REFERENCIA.diaExtenso}>
          <View style={styles.blocoAtividades}>
            {atividadesDia.map((atividade) => {
              const status = statusDoCard(atividade.tipo);
              return (
                <TouchableOpacity
                  key={atividade.id}
                  testID={'atividade-' + atividade.id}
                  style={styles.activityCard}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('RegistrarPoda', { tipo: atividade.tipo })}
                >
                  <View style={[styles.activityIcon, { backgroundColor: atividade.cor }]}>
                    <Text>{atividade.icon}</Text>
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityLabel}>{atividade.label}</Text>
                    <Text style={[styles.activitySub, !!status && styles.activitySubAtivo]}>
                      {status || atividade.sub}
                    </Text>
                  </View>
                  <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Atividades da Semana */}
        <Card
          title="Atividades da Semana"
          subtitle={DATA_REFERENCIA.intervaloSemana}
          right={
            <TouchableOpacity
              testID="ver-calendario"
              onPress={() => navigation.navigate('Agenda')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.linkText}>Ver calendário</Text>
            </TouchableOpacity>
          }
        >
          <View style={styles.blocoSemana}>
            {itensSemana.map((item) => (
              <TouchableOpacity
                key={item.id}
                testID={'semana-' + item.id}
                style={styles.weeklyItem}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Agenda')}
              >
                <Text style={styles.weeklyIcon}>{item.icon}</Text>
                <View style={styles.weeklyInfo}>
                  <Text style={styles.weeklyLabel}>{item.label}</Text>
                  <Text style={styles.weeklyValue}>{item.value}</Text>
                </View>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Trechos da Rodovia */}
        <Card
          testID="ver-trechos"
          title="Trechos da Rodovia"
          subtitle="Status de vegetação, previsão de IA e inspeções"
          onPress={() => navigation.navigate('Trechos')}
        />

        {/* Resumo da Semana */}
        <Card title="Resumo da semana">
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>📋</Text>
              <Text testID="stat-dias" style={styles.summaryNumber}>
                {resumoSemana.dias}
              </Text>
              <Text style={styles.summaryLabel}>Dias de poda</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>📍</Text>
              <Text testID="stat-locais" style={styles.summaryNumber}>
                {resumoSemana.locais}
              </Text>
              <Text style={styles.summaryLabel}>locais</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>🕐</Text>
              <Text testID="stat-horario" style={styles.summaryNumber}>
                {resumoSemana.horarioInicio}
              </Text>
              <Text style={styles.summaryLabel}>horário de início</Text>
            </View>
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
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: 'bold',
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
  blocoAtividades: {
    marginTop: 12,
  },
  blocoSemana: {
    marginTop: 4,
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
  activitySubAtivo: {
    color: colors.primary,
    fontWeight: '600',
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
