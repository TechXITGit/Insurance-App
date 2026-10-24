import { apiClient } from './apiClient';
import { storage } from '../utils/storage';
import { AuthenticatedUser } from '../types/auth';

const USE_MOCK_AUTH = !process.env.EXPO_PUBLIC_API_URL;

const MOCK_USER: AuthenticatedUser = {
  id: 'usr_demo_101',
  fullName: 'Aarav Mehta',
  phone: '9876543210',
  email: 'aarav.mehta@example.com',
  isKycVerified: true,
  city: 'Mumbai',
  pincode: '400001',
  createdAt: '2025-06-12T10:00:00Z',
};

export const authService = {
  /**
   * Sign in with Email and Password (demo mode supported)
   */
  async loginWithEmail(email: string, password: string): Promise<{ token: string; user: AuthenticatedUser }> {
    if (USE_MOCK_AUTH) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const token = `demo_jwt_token_${Date.now()}`;
      const storedProfile = await storage.getItem<{ fullName?: string }>('insured_profile_data');
      const preferredName = storedProfile?.fullName?.trim() || MOCK_USER.fullName;
      const user: AuthenticatedUser = {
        ...MOCK_USER,
        fullName: preferredName,
        email: email.trim() || 'demo@insureease.in',
      };
      await storage.setSecureItem('auth_token', token);
      await storage.setItem('cached_user', user);
      return { token, user };
    }
    const response = await apiClient.post('/auth/login', { email, password });
    const { token, user } = response.data;
    await storage.setSecureItem('auth_token', token);
    await storage.setItem('cached_user', user);
    return { token, user };
  },
  /**
   * Request 6-digit OTP for phone number
   */
  async requestOtp(phone: string): Promise<{ success: boolean; message: string; isDemoMode: boolean }> {
    if (USE_MOCK_AUTH) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return {
        success: true,
        message: 'Demo OTP sent! Use code 123456 in development.',
        isDemoMode: true,
      };
    }
    const response = await apiClient.post('/auth/request-otp', { phone });
    return response.data;
  },

  /**
   * Verify OTP and receive auth token + user profile
   */
  async verifyOtp(phone: string, otp: string): Promise<{ token: string; user: AuthenticatedUser }> {
    if (USE_MOCK_AUTH) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      // Demo acceptance: accept 123456 or any 6 digit in mock mode
      const token = `demo_jwt_token_${Date.now()}`;
      const storedProfile = await storage.getItem<{ fullName?: string }>('insured_profile_data');
      const preferredName = storedProfile?.fullName?.trim() || MOCK_USER.fullName;
      const user: AuthenticatedUser = {
        ...MOCK_USER,
        fullName: preferredName,
        phone,
      };
      await storage.setSecureItem('auth_token', token);
      await storage.setItem('cached_user', user);
      return { token, user };
    }
    const response = await apiClient.post('/auth/verify-otp', { phone, otp });
    const { token, user } = response.data;
    await storage.setSecureItem('auth_token', token);
    await storage.setItem('cached_user', user);
    return { token, user };
  },

  /**
   * Register a new user profile
   */
  async createAccount(data: {
    fullName: string;
    phone: string;
    email: string;
  }): Promise<{ token: string; user: AuthenticatedUser }> {
    if (USE_MOCK_AUTH) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const token = `demo_jwt_token_${Date.now()}`;
      const user: AuthenticatedUser = {
        id: `usr_${Date.now()}`,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        isKycVerified: false,
        city: 'Delhi',
        createdAt: new Date().toISOString(),
      };
      await storage.setSecureItem('auth_token', token);
      await storage.setItem('cached_user', user);
      return { token, user };
    }
    const response = await apiClient.post('/auth/register', data);
    const { token, user } = response.data;
    await storage.setSecureItem('auth_token', token);
    await storage.setItem('cached_user', user);
    return { token, user };
  },

  /**
   * Restore existing session from storage
   */
  async getStoredSession(): Promise<{ token: string | null; user: AuthenticatedUser | null }> {
    try {
      const token = await storage.getSecureItem('auth_token');
      const user = await storage.getItem<AuthenticatedUser>('cached_user');
      if (user) {
        const storedProfile = await storage.getItem<{ fullName?: string }>('insured_profile_data');
        if (storedProfile?.fullName?.trim()) {
          user.fullName = storedProfile.fullName.trim();
        }
      }
      return { token, user };
    } catch {
      return { token: null, user: null };
    }
  },

  /**
   * Logout user and clear tokens
   */
  async logout(): Promise<void> {
    try {
      if (!USE_MOCK_AUTH) {
        await apiClient.post('/auth/logout').catch(() => {});
      }
    } finally {
      await storage.removeSecureItem('auth_token');
      await storage.removeItem('cached_user');
      await storage.removeItem('insured_profile_data');
      await storage.removeItem('insured_profile_submitted');
    }
  },
};
