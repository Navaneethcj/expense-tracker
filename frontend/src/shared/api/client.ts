import axios from 'axios';
import Constants from 'expo-constants';
import { getStoredToken, clearToken } from '../storage/auth';

// Android uses your LAN IP.
// Web running on the same PC uses localhost.
const API_URL = process.env.EXPO_PUBLIC_API_URL!;

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await getStoredToken();

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await clearToken();
    }

    return Promise.reject(error);
  }
);

export default api;