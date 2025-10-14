import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'client' | 'barber' | 'owner' | 'admin' | 'superadmin';
  salonId?: string;
  profilePhoto?: string;
  isVerified: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (phoneOrEmail: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: (callback?: () => void) => void;
  updateProfile: (userData: any) => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (phoneOrEmail: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/login', {
            phoneOrEmail,
            password,
          });

          const { token, user } = response.data;
          
          set({
            user,
            token,
            isLoading: false,
          });

          // Store token in localStorage for API requests
          localStorage.setItem('token', token);
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.response?.data?.message || 'Login failed');
        }
      },

      register: async (userData: any) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/register', userData);

          const { token, user } = response.data;
          
          set({
            user,
            token,
            isLoading: false,
          });

          // Store token in localStorage for API requests
          localStorage.setItem('token', token);
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.response?.data?.message || 'Registration failed');
        }
      },

      logout: (callback?: () => void) => {
        set({
          user: null,
          token: null,
        });
        localStorage.removeItem('token');
        if (callback) {
          callback();
        }
      },

      updateProfile: async (userData: any) => {
        set({ isLoading: true });
        try {
          const response = await api.patch('/auth/me', userData);
          const { user } = response.data;
          
          set({
            user,
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.response?.data?.message || 'Profile update failed');
        }
      },

      setUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);
