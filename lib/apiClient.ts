import type { ApiError } from '@/types/frontend';

// Always use relative /api — frontend and backend are the same Next.js process.
// NEXT_PUBLIC_API_URL may point to the wrong port in some .env setups.
const API_BASE = '/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('qb_token');
}

export function setToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('qb_token', token);
}

export function clearToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('qb_token');
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, skipAuth = false } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (!skipAuth) {
    const token = getToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Handle empty responses (e.g. 204)
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const err = data as ApiError;
    const message =
      err.message ||
      err.error ||
      (err.fields ? Object.values(err.fields).flat().join(', ') : null) ||
      `Request failed with status ${response.status}`;

    // Auto-clear auth on 401 — but NOT for auth routes or when already on /login
    if (response.status === 401) {
      clearToken();
      if (
        typeof window !== 'undefined' &&
        !path.startsWith('/auth') &&
        !window.location.pathname.startsWith('/login') &&
        !window.location.pathname.startsWith('/register')
      ) {
        window.location.href = '/login';
      }
    }

    throw new Error(message);
  }

  return data as T;
}
