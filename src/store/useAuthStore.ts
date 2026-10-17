import { create } from 'zustand';
import { setAuthToken } from '../lib/api';

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;

  login: (user: User, token: string) => void;
  logout: () => void;
  checkAuth: () => void;
}

const read = (key: string) => {
  try { return localStorage.getItem(key); } catch { return null; }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,

  login: (user, token) => {
    setAuthToken(token);
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } catch { /* storage unavailable */ }
    set({ user, token, isAuthenticated: true, isAdmin: user.isAdmin, isLoading: false });
  },

  logout: () => {
    setAuthToken(null);
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch { /* storage unavailable */ }
    set({ user: null, token: null, isAuthenticated: false, isAdmin: false });
  },

  checkAuth: () => {
    try {
      const token = read('token');
      const userStr = read('user');
      if (token && userStr) {
        const user = JSON.parse(userStr) as User;
        setAuthToken(token);
        set({ user, token, isAuthenticated: true, isAdmin: user.isAdmin, isLoading: false });
        return;
      }
    } catch { /* corrupt storage: fall through to signed-out */ }
    set({ isLoading: false });
  },
}));
