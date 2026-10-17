import { create } from 'zustand';
import { setAuthToken, setUnauthorizedHandler } from '../lib/api';

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  isAdmin: boolean;
  phone?: string;
  address?: string;
  avatar?: string; // data URL, stored on this device only
}

type Extras = Pick<User, 'phone' | 'address' | 'avatar'>;

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;

  login: (user: User, token: string) => void;
  logout: () => void;
  checkAuth: () => void;
  updateProfile: (patch: Extras) => void;
}

const read = (key: string) => {
  try { return localStorage.getItem(key); } catch { return null; }
};
const write = (key: string, value: string) => {
  try { localStorage.setItem(key, value); } catch { /* storage unavailable */ }
};

// Phone, address and avatar are kept per email so they survive sign-out.
const extrasKey = (email: string) => `profile:${email.toLowerCase()}`;
const readExtras = (email: string): Extras => {
  try { return JSON.parse(read(extrasKey(email)) || '{}'); } catch { return {}; }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,

  login: (user, token) => {
    const merged: User = { ...readExtras(user.email), ...user };
    // Backend values win only when actually present.
    (['phone', 'address', 'avatar'] as const).forEach((k) => { if (!user[k]) merged[k] = readExtras(user.email)[k]; });
    setAuthToken(token);
    write('token', token);
    write('user', JSON.stringify(merged));
    set({ user: merged, token, isAuthenticated: true, isAdmin: merged.isAdmin, isLoading: false });
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

  updateProfile: (patch) => {
    const { user } = get();
    if (!user) return;
    const next: User = { ...user, ...patch };
    write('user', JSON.stringify(next));
    write(extrasKey(user.email), JSON.stringify({ phone: next.phone, address: next.address, avatar: next.avatar }));
    set({ user: next });
  },
}));

// An expired or revoked token should sign the user out instead of leaving a half-signed-in UI.
setUnauthorizedHandler(() => useAuthStore.getState().logout());
