import axios from 'axios';
import { getStoredToken, clearToken } from '../storage/auth';

const api = axios.create({
  baseURL: "https://expense-tracker-api-1rq8.onrender.com",
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