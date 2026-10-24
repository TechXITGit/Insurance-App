import { create } from 'zustand';
import { storage } from '../utils/storage';

interface SavedPlansState {
  savedPlanIds: string[];
  isLoading: boolean;
  loadSavedPlans: () => Promise<void>;
  toggleSavePlan: (planId: string) => Promise<boolean>;
  isSaved: (planId: string) => boolean;
}

export const useSavedPlansStore = create<SavedPlansState>((set, get) => ({
  savedPlanIds: [],
  isLoading: false,

  loadSavedPlans: async () => {
    set({ isLoading: true });
    try {
      const ids = (await storage.getItem<string[]>('saved_plan_ids')) || [];
      set({ savedPlanIds: ids, isLoading: false });
    } catch {
      set({ savedPlanIds: [], isLoading: false });
    }
  },

  toggleSavePlan: async (planId: string) => {
    const current = get().savedPlanIds;
    const exists = current.includes(planId);
    const updated = exists ? current.filter((id) => id !== planId) : [...current, planId];
    set({ savedPlanIds: updated });
    await storage.setItem('saved_plan_ids', updated);
    return !exists;
  },

  isSaved: (planId: string) => {
    return get().savedPlanIds.includes(planId);
  },
}));
