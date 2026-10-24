import { create } from 'zustand';
import { AuthenticatedUser, PendingAction } from '../types/auth';
import { authService } from '../services/authService';
import { storage } from '../utils/storage';

interface AuthStoreState {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  pendingAction: PendingAction | null;

  // Actions
  initAuth: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<{ user: AuthenticatedUser }>;
  requestOtp: (phone: string) => Promise<{ success: boolean; message: string; isDemoMode: boolean }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ user: AuthenticatedUser }>;
  createAccount: (data: { fullName: string; phone: string; email: string }) => Promise<{ user: AuthenticatedUser }>;
  logout: () => Promise<void>;
  setPendingAction: (action: PendingAction | null) => void;
  consumePendingAction: () => PendingAction | null;
  updateUserProfile: (updates: Partial<AuthenticatedUser>) => void;
}

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  pendingAction: null,

  initAuth: async () => {
    try {
      set({ isLoading: true });
      const { user } = await authService.getStoredSession();
      set({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  loginWithEmail: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { user } = await authService.loginWithEmail(email, password);
      set({ user, isAuthenticated: true, isLoading: false });
      return { user };
    } finally {
      set({ isLoading: false });
    }
  },

  requestOtp: async (phone: string) => {
    return await authService.requestOtp(phone);
  },

  verifyOtp: async (phone: string, otp: string) => {
    set({ isLoading: true });
    try {
      const { user } = await authService.verifyOtp(phone, otp);
      set({ user, isAuthenticated: true, isLoading: false });
      return { user };
    } finally {
      set({ isLoading: false });
    }
  },

  createAccount: async (data) => {
    set({ isLoading: true });
    try {
      const { user } = await authService.createAccount(data);
      set({ user, isAuthenticated: true, isLoading: false });
      return { user };
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      set({ user: null, isAuthenticated: false, pendingAction: null, isLoading: false });
    } finally {
      set({ isLoading: false });
    }
  },

  setPendingAction: (action) => {
    set({ pendingAction: action });
  },

  consumePendingAction: () => {
    const action = get().pendingAction;
    set({ pendingAction: null });
    return action;
  },

  updateUserProfile: (updates) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      set({ user: updatedUser });
      storage.setItem('cached_user', updatedUser);
    }
  },
}));
