import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import OptionRow from '../components/OptionRow';
import PrimaryButton from '../components/PrimaryButton';
import InlineMessage from '../components/InlineMessage';
import StateView from '../components/StateView';
import AuthService from '../services/AuthService';
import AgendaService from '../services/AgendaService';
import TrechosService from '../services/TrechosService';
import NotificacoesService from '../services/NotificacoesService';
import MockScenarioService from '../services/MockScenarioService';
import { CENARIOS_INFO, CENARIO_PADRAO } from '../mocks/mockScenarios';

function Linha({ rotulo, valor, testID }) {
  return (
    <View style={styles.linha}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <Text testID={testID} style={styles.valor}>
        {valor}
      </Text>
    </View>
  );
}

export default function PerfilScreen() {
  const navigation = useNavigation();
  const [perfil, setPerfil] = useState(null);
  const [cenario, setCenario] = useState(CENARIO_PADRAO);
  const [mensagem, setMensagem] = useState(null);

  useEffect(() => {
    let ativo = true;

    Promise.all([AuthService.getPerfil(), MockScenarioService.getCenario()]).then(
      ([dadosPerfil, cenarioAtual]) => {
        if (!ativo) return;
        setPerfil(dadosPerfil);
        setCenario(cenarioAtual);
      }
    );

    return () => {
      ativo = false;
    };
  }, []);

  async function trocarCenario(id) {
    const aplicado = await MockScenarioService.setCenario(id);
    setCenario(aplicado);
    const info = CENARIOS_INFO.find((item) => item.id === aplicado);
    setMensagem({
      type: 'info',
      text: 'Cenário "' + info.titulo + '" aplicado. Abra Trechos, Agenda ou Notificações para ver o efeito.',
    });
  }

  async function restaurarDados() {
    await TrechosService.resetarDados();
    await AgendaService.limparRegistros();
    await NotificacoesService.resetarLeituras();
    await MockScenarioService.setCenario(CENARIO_PADRAO);
    setCenario(CENARIO_PADRAO);
    setMensagem({
      type: 'success',
      text: 'Dados de demonstração restaurados ao estado original do mock.',
    });
  }

  async function sair() {
    await AuthService.clearUser();
    navigation.reset({ index: 0, routes: [{ name: 'Register' }] });
  }

  if (!perfil) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
          <ScreenHeader title="Perfil" onBack={() => navigation.goBack()} />
          <StateView testID="perfil-loading" variant="loading" message="Carregando seu perfil..." />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenHeader
          title="Perfil"
          subtitle="Dados do operador e configurações do app"
          onBack={() => navigation.goBack()}
        />

        <Card>
          <View style={styles.avatarLinha}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTexto}>{perfil.nome.charAt(0)}</Text>
            </View>
            <View style={styles.avatarInfo}>
              <Text testID="perfil-nome" style={styles.nome}>
                {perfil.nome}
              </Text>
              <Text style={styles.cargo}>{perfil.cargo}</Text>
            </View>
          </View>
        </Card>

        <Card title="Dados operacionais">
          <View style={styles.bloco}>
            <Linha rotulo="Email" valor={perfil.email} testID="perfil-email" />
            <Linha rotulo="Matrícula" valor={perfil.matricula} />
            <Linha rotulo="Equipe" valor={perfil.equipe} />
            <Linha rotulo="Regional" valor={perfil.regional} />
            <Linha rotulo="Telefone" valor={perfil.telefone} />
          </View>
        </Card>

        <Card
          title="Modo de demonstração"
          subtitle="Simula as respostas da API enquanto a integração real não existe"
        >
          <View style={styles.bloco}>
            {CENARIOS_INFO.map((item) => (
              <OptionRow
                key={item.id}
                testID={'cenario-' + item.id}
                title={item.emoji + '  ' + item.titulo}
                description={item.descricao}
                selected={cenario === item.id}
                onPress={() => trocarCenario(item.id)}
              />
            ))}

            {mensagem ? <InlineMessage testID="perfil-mensagem" {...mensagem} /> : null}

            <PrimaryButton
              testID="restaurar-dados-button"
              label="RESTAURAR DADOS DE DEMONSTRAÇÃO"
              variant="secondary"
              onPress={restaurarDados}
              style={styles.restaurar}
            />
          </View>
        </Card>

        <PrimaryButton
          testID="perfil-logout-button"
          label="SAIR DA CONTA"
          variant="danger"
          onPress={sair}
        />
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
  avatarLinha: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarTexto: {
    color: colors.background,
    fontSize: 22,
    fontWeight: 'bold',
  },
  avatarInfo: {
    flex: 1,
  },
  nome: {
    color: colors.text,
    fontSize: 17,
    fontWeight: 'bold',
  },
  cargo: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  bloco: {
    marginTop: 12,
  },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  rotulo: {
    color: colors.textMuted,
    fontSize: 12,
    marginRight: 12,
  },
  valor: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  restaurar: {
    marginTop: 14,
  },
});
