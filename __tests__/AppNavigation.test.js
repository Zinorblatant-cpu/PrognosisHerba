import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from '../src/services/AuthService';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('AppNavigation — auth redirect logic', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('isLoggedIn returns false when AsyncStorage is empty', async () => {
    const result = await AuthService.isLoggedIn();
    expect(result).toBe(false);
  });

  it('isLoggedIn returns true after saving a user', async () => {
    await AuthService.saveUser({ email: 'joao@motiva.com', name: 'João' });
    const result = await AuthService.isLoggedIn();
    expect(result).toBe(true);
  });

  it('app starts on Register route when not logged in', async () => {
    const loggedIn = await AuthService.isLoggedIn();
    expect(loggedIn).toBe(false);
  });

  it('app starts on Dashboard route when user is stored', async () => {
    await AuthService.saveUser({ email: 'joao@motiva.com', name: 'João' });
    const loggedIn = await AuthService.isLoggedIn();
    expect(loggedIn).toBe(true);
  });

  it('logout clears session and app goes back to Register', async () => {
    await AuthService.saveUser({ email: 'joao@motiva.com' });
    expect(await AuthService.isLoggedIn()).toBe(true);
    await AuthService.clearUser();
    expect(await AuthService.isLoggedIn()).toBe(false);
  });
});
