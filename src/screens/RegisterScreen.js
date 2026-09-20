import React, { useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AppLogo from '../components/AppLogo';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import InlineMessage from '../components/InlineMessage';
import { colors } from '../theme/colors';
import AuthService from '../services/AuthService';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [falha, setFalha] = useState(null);
  const [salvando, setSalvando] = useState(false);

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
    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }
    return newErrors;
  }

  async function handleRegister() {
    setFalha(null);
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setSalvando(true);

    try {
      await AuthService.registerAccount({ email, senha: password });
      navigation.navigate('Login');
    } catch (e) {
      setFalha(e.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <AppLogo />
        <Text style={styles.title}>REGISTRAR</Text>

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

        <FormInput
          label="Confirme suas senhas:"
          testID="confirm-password-input"
          placeholder="CONFIRME SUA SENHA"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          error={errors.confirmPassword}
        />

        <PrimaryButton
          testID="register-button"
          label="REGISTRAR"
          onPress={handleRegister}
          loading={salvando}
          style={styles.button}
        />

        {falha ? <InlineMessage testID="registro-falha" type="error" text={falha} /> : null}

        <TouchableOpacity
          testID="ir-para-login"
          onPress={() => navigation.navigate('Login')}
          style={styles.linkArea}
        >
          <Text style={styles.linkText}>Já tenho conta. Entrar</Text>
        </TouchableOpacity>
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
});
