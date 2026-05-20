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
