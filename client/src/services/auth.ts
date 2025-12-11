import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export interface AuthResponse {
  user: {
    id: string;
    email: string;
  };
  token: string;
}

export interface User {
  id: string;
  email: string;
}

const api = axios.create({
  baseURL: API_BASE,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async signup(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/signup', {
      email,
      password,
    });
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('user_id', response.data.user.id);
    return response.data;
  },

  async signin(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/signin', {
      email,
      password,
    });
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('user_id', response.data.user.id);
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/api/auth/logout');
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_id');
    }
  },

  getStoredUser(): User | null {
    const token = localStorage.getItem('auth_token');
    const userId = localStorage.getItem('user_id');
    
    if (!token || !userId) return null;
    
    try {
      // Decode JWT to get user info (simple approach)
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      return {
        id: payload.userId,
        email: payload.email,
      };
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },
};
