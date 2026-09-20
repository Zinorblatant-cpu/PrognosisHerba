import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AppLogo from '../components/AppLogo';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import InlineMessage from '../components/InlineMessage';
import { colors } from '../theme/colors';
import AuthService from '../services/AuthService';
import { CONTA_DEMO } from '../mocks/usuarioMock';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [falha, setFalha] = useState(null);
  const [entrando, setEntrando] = useState(false);

  function validate() {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido';
    }
    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    }
    return newErrors;
  }

  async function handleLogin() {
    setFalha(null);
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setEntrando(true);

    try {
      await AuthService.login({ email, senha: password });
      navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
    } catch (e) {
      setFalha(e.message);
    } finally {
      setEntrando(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <AppLogo />
        <Text style={styles.title}>LOGIN</Text>

        <FormInput
          label="Email:"
          testID="email-input"
          placeholder="COLOQUE SEU EMAIL"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        <FormInput
          label="Senha:"
          testID="password-input"
          placeholder="COLOQUE SUA SENHA"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={errors.password}
        />

        <PrimaryButton
          testID="login-button"
          label="LOGAR"
          onPress={handleLogin}
          loading={entrando}
          style={styles.button}
        />

        {falha ? <InlineMessage testID="login-falha" type="error" text={falha} /> : null}

        <TouchableOpacity
          testID="ir-para-registro"
          onPress={() => navigation.navigate('Register')}
          style={styles.linkArea}
        >
          <Text style={styles.linkText}>Não tem conta? Criar cadastro</Text>
        </TouchableOpacity>

        <View style={styles.dica}>
          <Text style={styles.dicaTitulo}>Conta de demonstração</Text>
          <Text style={styles.dicaTexto}>
            {CONTA_DEMO.email} • senha: {CONTA_DEMO.senha}
          </Text>
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
    flexGrow: 1,
    padding: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: 2,
  },
  button: {
    marginTop: 24,
  },
  linkArea: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  dica: {
    marginTop: 28,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
  },
  dicaTitulo: {
    color: colors.textLabel,
    fontSize: 12,
    fontWeight: '600',
  },
  dicaTexto: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
});
