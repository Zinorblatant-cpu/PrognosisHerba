import AsyncStorage from '@react-native-async-storage/async-storage';
import { USUARIO_MOCK, CONTA_DEMO, getPrimeiroNome } from '../mocks/usuarioMock';
import { hashSenha, gerarSalt } from '../utils/sha256';
import { Relogio } from '../utils/datas';

const USER_KEY = '@prognosisherba:user';
const CONTAS_KEY = '@prognosisherba:contas';
const RECUPERACAO_KEY = '@prognosisherba:recuperacao';

export const VALIDADE_CODIGO_MIN = 10;
export const MAX_TENTATIVAS_CODIGO = 5;

// Erro de autenticação simulada — as telas exibem `message` direto para o usuário.
export class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthError';
    this.isAuthError = true;
  }
}

// Sprint 4 (P1): a senha nunca é gravada em texto. Cada conta tem um salt
// próprio e guarda só o hash iterado (ver src/utils/sha256.js).
function protegerSenha(senha) {
  const salt = gerarSalt();
  return { salt, senhaHash: hashSenha(senha, salt) };
}

function senhaConfere(conta, senha) {
  if (conta.senhaHash && conta.salt) return hashSenha(senha, conta.salt) === conta.senhaHash;
  // Conta criada antes da Sprint 4, ainda com senha em texto.
  return conta.senha === senha;
}

function semSegredos({ senha, senhaHash, salt, ...conta }) {
  return conta;
}

function mascararEmail(email) {
  const [usuario, dominio] = String(email).split('@');
  if (!dominio) return email;
  return usuario.charAt(0) + '***@' + dominio;
}

function gerarCodigo() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function nomeAPartirDoEmail(email) {
  const usuario = String(email).split('@')[0].replace(/[._-]+/g, ' ');
  return usuario
    .split(' ')
    .filter(Boolean)
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(' ');
}

const AuthService = {
  async saveUser(user) {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  async getUser() {
    const data = await AsyncStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  async clearUser() {
    await AsyncStorage.removeItem(USER_KEY);
  },

  async isLoggedIn() {
    const data = await AsyncStorage.getItem(USER_KEY);
    return data !== null;
  },

  // --- Contas cadastradas (mock de base de usuários) -----------------------

  async getContas() {
    const data = await AsyncStorage.getItem(CONTAS_KEY);
    return data ? JSON.parse(data) : [];
  },

  async registerAccount({ email, senha }) {
    const normalizado = String(email).trim().toLowerCase();

    if (normalizado === CONTA_DEMO.email) {
      throw new AuthError('Este email já está cadastrado. Faça login.');
    }

    const contas = await this.getContas();
    if (contas.some((conta) => conta.email === normalizado)) {
      throw new AuthError('Este email já está cadastrado. Faça login.');
    }

    const novaConta = {
      email: normalizado,
      ...protegerSenha(senha),
      nome: nomeAPartirDoEmail(normalizado),
      cargo: USUARIO_MOCK.cargo,
      equipe: USUARIO_MOCK.equipe,
      regional: USUARIO_MOCK.regional,
      criadaEm: new Date().toISOString().slice(0, 10),
    };

    await AsyncStorage.setItem(CONTAS_KEY, JSON.stringify([...contas, novaConta]));
    return semSegredos(novaConta);
  },

  async login({ email, senha }) {
    const normalizado = String(email).trim().toLowerCase();

    if (normalizado === CONTA_DEMO.email && senha === CONTA_DEMO.senha) {
      const user = { ...USUARIO_MOCK };
      await this.saveUser(user);
      return user;
    }

    const contas = await this.getContas();
    const conta = contas.find((item) => item.email === normalizado);

    if (!conta || !senhaConfere(conta, senha)) {
      throw new AuthError('Email ou senha incorretos. Verifique seus dados.');
    }

    // Migração transparente: conta legada (senha em texto) passa a ter hash
    // no primeiro login bem-sucedido.
    if (!conta.senhaHash) {
      const migradas = contas.map((item) =>
        item.email === normalizado ? { ...semSegredos(item), ...protegerSenha(senha) } : item
      );
      await AsyncStorage.setItem(CONTAS_KEY, JSON.stringify(migradas));
    }

    const user = semSegredos(conta);
    const perfil = {
      ...USUARIO_MOCK,
      ...user,
      matricula: USUARIO_MOCK.matricula,
    };
    await this.saveUser(perfil);
    return perfil;
  },

  // Perfil exibido no app: o usuário logado, completado com os campos
  // operacionais do mock quando a conta foi criada pelo próprio cadastro.
  async getPerfil() {
    const user = await this.getUser();
    if (!user) return { ...USUARIO_MOCK };
    return { ...USUARIO_MOCK, ...user };
  },

  // --- Recuperação de senha (Sprint 4 — P5) ---------------------------------
  //
  // Sem backend, o código de verificação é devolvido para a tela exibir no
  // "modo demonstração". Com a API, ele seria enviado ao email corporativo e
  // este método passaria a retornar apenas o email mascarado.

  async solicitarRecuperacao(email) {
    const normalizado = String(email).trim().toLowerCase();

    if (normalizado === CONTA_DEMO.email) {
      throw new AuthError(
        'A conta de demonstração tem senha fixa (' + CONTA_DEMO.senha + '). Use outra conta para testar a recuperação.'
      );
    }

    const contas = await this.getContas();
    if (!contas.some((conta) => conta.email === normalizado)) {
      throw new AuthError('Não encontramos uma conta com esse email.');
    }

    const codigo = gerarCodigo();
    const salt = gerarSalt(8);
    const pedido = {
      email: normalizado,
      salt,
      codigoHash: hashSenha(codigo, salt, 1),
      expiraEm: Relogio.agora().getTime() + VALIDADE_CODIGO_MIN * 60000,
      tentativas: 0,
    };
    await AsyncStorage.setItem(RECUPERACAO_KEY, JSON.stringify(pedido));

    return { emailMascarado: mascararEmail(normalizado), codigo, validadeMin: VALIDADE_CODIGO_MIN };
  },

  async redefinirSenha({ email, codigo, novaSenha }) {
    const normalizado = String(email).trim().toLowerCase();
    const data = await AsyncStorage.getItem(RECUPERACAO_KEY);
    const pedido = data ? JSON.parse(data) : null;

    if (!pedido || pedido.email !== normalizado) {
      throw new AuthError('Solicite um novo código de recuperação.');
    }
    if (Relogio.agora().getTime() > pedido.expiraEm) {
      await AsyncStorage.removeItem(RECUPERACAO_KEY);
      throw new AuthError('O código expirou. Solicite um novo.');
    }
    if (hashSenha(String(codigo).trim(), pedido.salt, 1) !== pedido.codigoHash) {
      const tentativas = pedido.tentativas + 1;
      if (tentativas >= MAX_TENTATIVAS_CODIGO) {
        await AsyncStorage.removeItem(RECUPERACAO_KEY);
        throw new AuthError('Muitas tentativas incorretas. Solicite um novo código.');
      }
      await AsyncStorage.setItem(RECUPERACAO_KEY, JSON.stringify({ ...pedido, tentativas }));
      throw new AuthError('Código incorreto. Confira e tente novamente.');
    }

    const contas = await this.getContas();
    const atualizadas = contas.map((conta) =>
      conta.email === normalizado ? { ...semSegredos(conta), ...protegerSenha(novaSenha) } : conta
    );
    await AsyncStorage.setItem(CONTAS_KEY, JSON.stringify(atualizadas));
    await AsyncStorage.removeItem(RECUPERACAO_KEY);
    return true;
  },

  getPrimeiroNome,
};

export default AuthService;
