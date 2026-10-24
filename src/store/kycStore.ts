import { create } from 'zustand';
import { KycData, KycDocument } from '../types/kyc';
import { kycService } from '../services/kycService';
import { useAuthStore } from './authStore';

interface KycStoreState {
  kycData: KycData | null;
  isVerified: boolean;
  isLoading: boolean;

  initKyc: () => Promise<void>;
  submitKyc: (formData: {
    fullName: string;
    panNumber: string;
    dob: string;
    gender: 'male' | 'female' | 'other';
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
    documents?: KycDocument[];
  }) => Promise<{ success: boolean; data: KycData }>;
  resetKyc: () => Promise<void>;
}

export const useKycStore = create<KycStoreState>((set) => ({
  kycData: null,
  isVerified: false,
  isLoading: true,

  initKyc: async () => {
    try {
      set({ isLoading: true });
      const data = await kycService.getKycData();
      const verified = data?.status === 'verified';
      set({
        kycData: data,
        isVerified: verified,
        isLoading: false,
      });

      // Synchronize with authStore if user exists
      if (verified) {
        useAuthStore.getState().updateUserProfile({ isKycVerified: true });
      }
    } catch {
      set({ kycData: null, isVerified: false, isLoading: false });
    }
  },

  submitKyc: async (formData) => {
    set({ isLoading: true });
    try {
      const res = await kycService.submitAndVerifyKyc(formData);
      set({
        kycData: res.data,
        isVerified: true,
        isLoading: false,
      });

      // Synchronize with authStore
      useAuthStore.getState().updateUserProfile({
        isKycVerified: true,
        fullName: res.data.fullName,
      });

      return { success: true, data: res.data };
    } finally {
      set({ isLoading: false });
    }
  },

  resetKyc: async () => {
    await kycService.clearKyc();
    set({ kycData: null, isVerified: false, isLoading: false });
  },
}));
