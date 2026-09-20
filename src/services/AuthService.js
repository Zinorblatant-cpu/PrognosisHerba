import AsyncStorage from '@react-native-async-storage/async-storage';
import { USUARIO_MOCK, CONTA_DEMO, getPrimeiroNome } from '../mocks/usuarioMock';

const USER_KEY = '@prognosisherba:user';
const CONTAS_KEY = '@prognosisherba:contas';

// Erro de autenticação simulada — as telas exibem `message` direto para o usuário.
export class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthError';
    this.isAuthError = true;
  }
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
      senha,
      nome: nomeAPartirDoEmail(normalizado),
      cargo: USUARIO_MOCK.cargo,
      equipe: USUARIO_MOCK.equipe,
      regional: USUARIO_MOCK.regional,
      criadaEm: new Date().toISOString().slice(0, 10),
    };

    await AsyncStorage.setItem(CONTAS_KEY, JSON.stringify([...contas, novaConta]));
    return novaConta;
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

    if (!conta || conta.senha !== senha) {
      throw new AuthError('Email ou senha incorretos. Verifique seus dados.');
    }

    const { senha: _senha, ...user } = conta;
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

  getPrimeiroNome,
};

export default AuthService;
