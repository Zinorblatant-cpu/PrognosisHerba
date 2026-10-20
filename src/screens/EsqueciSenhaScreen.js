import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenHeader from '../components/ScreenHeader';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import InlineMessage from '../components/InlineMessage';
import Card from '../components/Card';
import { colors } from '../theme/colors';
import AuthService from '../services/AuthService';
import { SENHA_MINIMA } from './RegisterScreen';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Sprint 4 (P5): "Esqueci minha senha" em duas etapas — pedir o código e
// definir a nova senha. Sem backend, o código aparece na tela (modo
// demonstração); com a API ele vai para o email corporativo do operador.
export default function EsqueciSenhaScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [etapa, setEtapa] = useState('email');
  const [email, setEmail] = useState(route?.params?.email || '');
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [pedido, setPedido] = useState(null);
  const [erros, setErros] = useState({});
  const [falha, setFalha] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function solicitarCodigo() {
    setFalha(null);
    if (!email) {
      setErros({ email: 'Email é obrigatório' });
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setErros({ email: 'Email inválido' });
      return;
    }
    setErros({});
    setEnviando(true);
    try {
      const resposta = await AuthService.solicitarRecuperacao(email);
      setPedido(resposta);
      setEtapa('codigo');
    } catch (e) {
      setFalha(e.message);
    } finally {
      setEnviando(false);
    }
  }

  async function redefinir() {
    setFalha(null);
    const novosErros = {};
    if (!/^\d{6}$/.test(codigo.trim())) novosErros.codigo = 'Digite o código de 6 dígitos';
    if (!novaSenha) novosErros.novaSenha = 'Senha é obrigatória';
    else if (novaSenha.length < SENHA_MINIMA)
      novosErros.novaSenha = 'A senha precisa ter pelo menos ' + SENHA_MINIMA + ' caracteres';
    if (novaSenha && novaSenha !== confirmacao) novosErros.confirmacao = 'As senhas não coincidem';

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }
    setErros({});
    setEnviando(true);
    try {
      await AuthService.redefinirSenha({ email, codigo, novaSenha });
      setEtapa('concluido');
    } catch (e) {
      setFalha(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <ScreenHeader
          title="Recuperar senha"
          subtitle={
            etapa === 'email'
              ? 'Informe o email da sua conta para receber um código'
              : etapa === 'codigo'
                ? 'Digite o código e escolha a nova senha'
                : 'Tudo certo'
          }
          onBack={() => navigation.goBack()}
        />

        {etapa === 'email' ? (
          <>
            <FormInput
              label="Email:"
              testID="recuperar-email-input"
              placeholder="COLOQUE SEU EMAIL"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={erros.email}
              accessibilityLabel="Email da conta"
            />
            <PrimaryButton
              testID="enviar-codigo-button"
              label="ENVIAR CÓDIGO"
              onPress={solicitarCodigo}
              loading={enviando}
              style={styles.botao}
            />
          </>
        ) : null}

        {etapa === 'codigo' && pedido ? (
          <>
            <Card testID="codigo-enviado">
              <Text style={styles.texto}>
                {'Código enviado para ' +
                  pedido.emailMascarado +
                  '. Ele vale por ' +
                  pedido.validadeMin +
                  ' minutos.'}
              </Text>
              <View style={styles.demo}>
                <Text style={styles.demoTitulo}>Ambiente de demonstração</Text>
                <Text style={styles.texto}>
                  Sem servidor de email nesta versão, o código aparece aqui:{' '}
                  <Text testID="codigo-demo" style={styles.codigo}>
                    {pedido.codigo}
                  </Text>
                </Text>
              </View>
            </Card>

            <FormInput
              label="Código:"
              testID="codigo-input"
              placeholder="000000"
              value={codigo}
              onChangeText={setCodigo}
              keyboardType="number-pad"
              maxLength={6}
              error={erros.codigo}
              accessibilityLabel="Código de verificação"
            />
            <FormInput
              label="Nova senha:"
              testID="nova-senha-input"
              placeholder="NOVA SENHA"
              value={novaSenha}
              onChangeText={setNovaSenha}
              secureTextEntry
              error={erros.novaSenha}
              accessibilityLabel="Nova senha"
            />
            <FormInput
              label="Confirmar nova senha:"
              testID="confirmar-nova-senha-input"
              placeholder="CONFIRME A NOVA SENHA"
              value={confirmacao}
              onChangeText={setConfirmacao}
              secureTextEntry
              error={erros.confirmacao}
              accessibilityLabel="Confirmar nova senha"
            />
            <PrimaryButton
              testID="redefinir-senha-button"
              label="REDEFINIR SENHA"
              onPress={redefinir}
              loading={enviando}
              style={styles.botao}
            />
            <PrimaryButton
              testID="reenviar-codigo-button"
              label="ENVIAR NOVO CÓDIGO"
              variant="secondary"
              onPress={solicitarCodigo}
              style={styles.botaoSecundario}
            />
          </>
        ) : null}

        {etapa === 'concluido' ? (
          <>
            <InlineMessage
              testID="senha-redefinida"
              type="success"
              text="Senha redefinida com sucesso. Entre com a nova senha."
            />
            <PrimaryButton
              testID="voltar-login-button"
              label="IR PARA O LOGIN"
              onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
              style={styles.botao}
            />
          </>
        ) : null}

        {falha ? <InlineMessage testID="recuperar-falha" type="error" text={falha} /> : null}
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
    paddingTop: 16,
  },
  botao: {
    marginTop: 20,
  },
  botaoSecundario: {
    marginTop: 12,
  },
  texto: {
    color: colors.textLabel,
    fontSize: 13,
    lineHeight: 19,
  },
  demo: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    paddingTop: 10,
  },
  demoTitulo: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  codigo: {
    color: colors.primary,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
});
