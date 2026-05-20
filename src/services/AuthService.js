import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_KEY = '@prognosisherba:user';

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
};

export default AuthService;
