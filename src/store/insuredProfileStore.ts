import { create } from 'zustand';
import { CategoryId } from '../types/insurance';

const memoryFallback = new Map<string, string>();
const safeStorage = {
  async getItem<T>(key: string): Promise<T | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { storage } = require('../utils/storage');
      return await storage.getItem(key);
    } catch {
      const val = memoryFallback.get(key);
      return val ? (JSON.parse(val) as T) : null;
    }
  },
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { storage } = require('../utils/storage');
      await storage.setItem(key, value);
    } catch {
      memoryFallback.set(key, JSON.stringify(value));
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { storage } = require('../utils/storage');
      await storage.removeItem(key);
    } catch {
      memoryFallback.delete(key);
    }
  },
};

export type InsuredRelation = 'self' | 'spouse' | 'son' | 'daughter' | 'father' | 'mother';

export interface InsuredProfileData {
  relation: InsuredRelation;
  fullName: string;
  age: string;
  gender: 'male' | 'female' | 'other';
  pincode: string;
  city: string;
  phone: string;
  email: string;
  hasPreExistingConditions: boolean;
  preExistingDetails: string;
  tobaccoUser: boolean;
  insuranceType: CategoryId | 'senior' | 'family';
}

interface InsuredProfileState {
  profile: InsuredProfileData;
  isProfileSubmitted: boolean;
  isHydrated: boolean;

  setProfile: (data: Partial<InsuredProfileData>) => void;
  submitProfile: (data?: Partial<InsuredProfileData>) => Promise<void>;
  resetProfile: () => Promise<void>;
  loadProfile: () => Promise<void>;
}

export const DEFAULT_INSURED_PROFILE: InsuredProfileData = {
  relation: 'self',
  fullName: '',
  age: '',
  gender: 'male',
  pincode: '',
  city: '',
  phone: '',
  email: '',
  hasPreExistingConditions: false,
  preExistingDetails: '',
  tobaccoUser: false,
  insuranceType: 'health',
};

const STORAGE_KEY_PROFILE = 'insured_profile_data';
const STORAGE_KEY_SUBMITTED = 'insured_profile_submitted';

export const useInsuredProfileStore = create<InsuredProfileState>((set, get) => ({
  profile: { ...DEFAULT_INSURED_PROFILE },
  isProfileSubmitted: false,
  isHydrated: false,

  loadProfile: async () => {
    try {
      const storedProfile = await safeStorage.getItem<InsuredProfileData>(STORAGE_KEY_PROFILE);
      const isSubmitted = await safeStorage.getItem<boolean>(STORAGE_KEY_SUBMITTED);
      set({
        profile: storedProfile ? { ...DEFAULT_INSURED_PROFILE, ...storedProfile } : { ...DEFAULT_INSURED_PROFILE },
        isProfileSubmitted: !!isSubmitted,
        isHydrated: true,
      });
    } catch {
      set({ isHydrated: true });
    }
  },

  setProfile: (updates) => {
    set((state) => ({
      profile: {
        ...state.profile,
        ...updates,
      },
    }));
  },

  submitProfile: async (data) => {
    const updated = {
      ...get().profile,
      ...(data || {}),
    };
    set({
      profile: updated,
      isProfileSubmitted: true,
    });
    try {
      await safeStorage.setItem(STORAGE_KEY_PROFILE, updated);
      await safeStorage.setItem(STORAGE_KEY_SUBMITTED, true);
    } catch (e) {
      console.warn('Failed to persist insured profile:', e);
    }
  },

  resetProfile: async () => {
    set({
      profile: { ...DEFAULT_INSURED_PROFILE },
      isProfileSubmitted: false,
    });
    try {
      await safeStorage.removeItem(STORAGE_KEY_PROFILE);
      await safeStorage.removeItem(STORAGE_KEY_SUBMITTED);
    } catch (e) {
      console.warn('Failed to clear insured profile:', e);
    }
  },
}));
