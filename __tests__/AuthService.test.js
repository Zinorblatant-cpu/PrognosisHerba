import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from '../src/services/AuthService';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('AuthService', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('saveUser stores user data in AsyncStorage', async () => {
    const user = { email: 'joao@motiva.com', name: 'João' };
    await AuthService.saveUser(user);
    const stored = await AsyncStorage.getItem('@prognosisherba:user');
    expect(JSON.parse(stored)).toEqual(user);
  });

  it('getUser retrieves stored user', async () => {
    const user = { email: 'joao@motiva.com', name: 'João' };
    await AsyncStorage.setItem('@prognosisherba:user', JSON.stringify(user));
    const result = await AuthService.getUser();
    expect(result).toEqual(user);
  });

  it('getUser returns null when no user stored', async () => {
    const result = await AuthService.getUser();
    expect(result).toBeNull();
  });

  it('clearUser removes user from AsyncStorage', async () => {
    const user = { email: 'joao@motiva.com', name: 'João' };
    await AsyncStorage.setItem('@prognosisherba:user', JSON.stringify(user));
    await AuthService.clearUser();
    const stored = await AsyncStorage.getItem('@prognosisherba:user');
    expect(stored).toBeNull();
  });

  it('isLoggedIn returns true when user is stored', async () => {
    await AsyncStorage.setItem(
      '@prognosisherba:user',
      JSON.stringify({ email: 'joao@motiva.com' })
    );
    const result = await AuthService.isLoggedIn();
    expect(result).toBe(true);
  });

  it('isLoggedIn returns false when no user stored', async () => {
    const result = await AuthService.isLoggedIn();
    expect(result).toBe(false);
  });
});

describe('AuthService — cadastro e login (Sprint 3)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('registerAccount cria a conta e a deixa disponível para login', async () => {
    await AuthService.registerAccount({ email: 'maria@motiva.com', senha: 'senha123' });

    const contas = await AuthService.getContas();
    expect(contas).toHaveLength(1);
    expect(contas[0].email).toBe('maria@motiva.com');
  });

  it('registerAccount normaliza o email para minúsculas', async () => {
    await AuthService.registerAccount({ email: '  Maria@Motiva.com ', senha: 'senha123' });
    const contas = await AuthService.getContas();
    expect(contas[0].email).toBe('maria@motiva.com');
  });

  it('registerAccount recusa email já cadastrado', async () => {
    await AuthService.registerAccount({ email: 'maria@motiva.com', senha: 'senha123' });
    await expect(
      AuthService.registerAccount({ email: 'maria@motiva.com', senha: 'outra' })
    ).rejects.toThrow(/já está cadastrado/);
  });

  it('registerAccount recusa o email da conta de demonstração', async () => {
    await expect(
      AuthService.registerAccount({ email: 'joao@motiva.com', senha: 'qualquer' })
    ).rejects.toThrow(/já está cadastrado/);
  });

  it('login aceita a conta de demonstração e grava a sessão', async () => {
    const user = await AuthService.login({ email: 'joao@motiva.com', senha: 'senha123' });

    expect(user.email).toBe('joao@motiva.com');
    expect(await AuthService.isLoggedIn()).toBe(true);
  });

  it('login aceita uma conta criada pelo cadastro', async () => {
    await AuthService.registerAccount({ email: 'maria@motiva.com', senha: 'senha123' });
    const user = await AuthService.login({ email: 'maria@motiva.com', senha: 'senha123' });

    expect(user.email).toBe('maria@motiva.com');
    expect(user.senha).toBeUndefined();
  });

  it('login recusa senha incorreta', async () => {
    await expect(
      AuthService.login({ email: 'joao@motiva.com', senha: 'errada' })
    ).rejects.toThrow(/incorretos/);
    expect(await AuthService.isLoggedIn()).toBe(false);
  });

  it('login recusa email não cadastrado', async () => {
    await expect(
      AuthService.login({ email: 'ninguem@motiva.com', senha: 'senha123' })
    ).rejects.toThrow(/incorretos/);
  });

  it('getPerfil completa os dados operacionais do usuário logado', async () => {
    await AuthService.registerAccount({ email: 'maria@motiva.com', senha: 'senha123' });
    await AuthService.login({ email: 'maria@motiva.com', senha: 'senha123' });

    const perfil = await AuthService.getPerfil();
    expect(perfil.email).toBe('maria@motiva.com');
    expect(perfil.matricula).toBeTruthy();
    expect(perfil.regional).toBeTruthy();
  });

  it('getPrimeiroNome extrai o primeiro nome para a saudação', () => {
    expect(AuthService.getPrimeiroNome('João Silva')).toBe('João');
    expect(AuthService.getPrimeiroNome('')).toBe('Operador');
  });

  describe('Sprint 4 — senha protegida e recuperação', () => {
    it('não grava a senha em texto: guarda salt + hash', async () => {
      await AuthService.registerAccount({ email: 'maria@motiva.com', senha: 'senha123' });
      const bruto = await AsyncStorage.getItem('@prognosisherba:contas');

      expect(bruto).not.toContain('senha123');
      const [conta] = JSON.parse(bruto);
      expect(conta.senha).toBeUndefined();
      expect(conta.salt).toHaveLength(32);
      expect(conta.senhaHash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('migra contas antigas (senha em texto) para hash no primeiro login', async () => {
      await AsyncStorage.setItem(
        '@prognosisherba:contas',
        JSON.stringify([{ email: 'antigo@motiva.com', senha: 'abc123', nome: 'Antigo' }])
      );

      await AuthService.login({ email: 'antigo@motiva.com', senha: 'abc123' });
      const [conta] = JSON.parse(await AsyncStorage.getItem('@prognosisherba:contas'));
      expect(conta.senha).toBeUndefined();
      expect(conta.senhaHash).toBeTruthy();

      await AuthService.clearUser();
      await expect(AuthService.login({ email: 'antigo@motiva.com', senha: 'abc123' })).resolves.toBeTruthy();
    });

    it('fluxo completo: solicitar código, redefinir e entrar com a nova senha', async () => {
      await AuthService.registerAccount({ email: 'maria@motiva.com', senha: 'senha123' });
      const { codigo, emailMascarado } = await AuthService.solicitarRecuperacao('maria@motiva.com');

      expect(codigo).toMatch(/^\d{6}$/);
      expect(emailMascarado).toBe('m***@motiva.com');

      await AuthService.redefinirSenha({ email: 'maria@motiva.com', codigo, novaSenha: 'novaSenha9' });
      await expect(AuthService.login({ email: 'maria@motiva.com', senha: 'senha123' })).rejects.toThrow();
      await expect(AuthService.login({ email: 'maria@motiva.com', senha: 'novaSenha9' })).resolves.toBeTruthy();
    });

    it('recusa código incorreto e bloqueia após 5 tentativas', async () => {
      await AuthService.registerAccount({ email: 'maria@motiva.com', senha: 'senha123' });
      const { codigo } = await AuthService.solicitarRecuperacao('maria@motiva.com');
      const errado = codigo === '000000' ? '111111' : '000000';

      for (let i = 0; i < 4; i++) {
        await expect(
          AuthService.redefinirSenha({ email: 'maria@motiva.com', codigo: errado, novaSenha: 'x12345' })
        ).rejects.toThrow('Código incorreto');
      }
      await expect(
        AuthService.redefinirSenha({ email: 'maria@motiva.com', codigo: errado, novaSenha: 'x12345' })
      ).rejects.toThrow('Muitas tentativas');
      await expect(
        AuthService.redefinirSenha({ email: 'maria@motiva.com', codigo, novaSenha: 'x12345' })
      ).rejects.toThrow('Solicite um novo código');
    });

    it('recusa código expirado', async () => {
      const { Relogio } = require('../src/utils/datas');
      await AuthService.registerAccount({ email: 'maria@motiva.com', senha: 'senha123' });
      const { codigo } = await AuthService.solicitarRecuperacao('maria@motiva.com');

      const daquiA11Min = new Date(Date.now() + 11 * 60000);
      const spy = jest.spyOn(Relogio, 'agora').mockReturnValue(daquiA11Min);
      await expect(
        AuthService.redefinirSenha({ email: 'maria@motiva.com', codigo, novaSenha: 'x12345' })
      ).rejects.toThrow('expirou');
      spy.mockRestore();
    });

    it('recusa recuperação de email não cadastrado e da conta de demonstração', async () => {
      await expect(AuthService.solicitarRecuperacao('ninguem@motiva.com')).rejects.toThrow('Não encontramos');
      await expect(AuthService.solicitarRecuperacao('joao@motiva.com')).rejects.toThrow('senha fixa');
    });
  });
});
