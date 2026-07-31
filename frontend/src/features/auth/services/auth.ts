import api from '../../../shared/api/client';
import { saveToken, clearToken, getStoredToken } from '../../../shared/storage/auth';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const register = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await api.post<ApiResponse<AuthResponse>>(
    '/api/auth/register',
    {
      name,
      email,
      password,
    }
  );

  return response.data.data;
};

export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await api.post<ApiResponse<AuthResponse>>(
    '/api/auth/login',
    {
      email,
      password,
    }
  );

  return response.data.data;
};

export const getProfile = async (): Promise<AuthUser> => {
  const response = await api.get<ApiResponse<AuthUser>>(
    '/api/auth/profile'
  );

  return response.data.data;
};

export { saveToken, clearToken, getStoredToken };