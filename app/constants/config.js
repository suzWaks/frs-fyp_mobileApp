import Constants from 'expo-constants';

const isDev = __DEV__;
const LOCAL_IP = '10.0.2.2'; // 'localhost' for iOS simulator

export default {
  API: {
    BASE_URL: isDev
      ? `http://${LOCAL_IP}:5432/api`
      : Constants.expoConfig.extra.API_BASE_URL,
    ENDPOINTS: {
      LOGIN: '/Auth/login',
      ROLES: '/Roles'
    }
  },
  ROUTES: {
    ADMIN: '/admin/dashboard',
    TUTOR: '/(tutor)/tutor',
    STUDENT: '/(students)/student',
    DAA: '/(tabs)/home',
    DEFAULT: '/home'
  },
  STORAGE_KEYS: {
    USER_DATA: 'userData',
    AUTH_TOKEN: 'authToken'
  }
};