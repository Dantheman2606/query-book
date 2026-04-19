import { apiRequest, setToken, clearToken } from '@/lib/apiClient';
import type { AuthUser, AuthResponse, LoginPayload, RegisterPayload, User } from '@/types/frontend';

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const data = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: payload,
    skipAuth: true,
  });
  setToken(data.token);
  return data;
}

export async function register(payload: RegisterPayload) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: payload,
    skipAuth: true,
  });
}

export async function getMe(): Promise<{ user: User }> {
  return apiRequest<{ user: User }>('/auth/me');
}

export function logout() {
  clearToken();
}
