import { create } from 'zustand';
import { CategoryId } from '../types/insurance';

interface CompareStoreState {
  selectedPlanIds: string[];
  activeCategoryId: CategoryId | null;

  // Actions
  addPlan: (planId: string, categoryId: CategoryId) => { success: boolean; message?: string };
  removePlan: (planId: string) => void;
  clearCompare: () => void;
  isInCompare: (planId: string) => boolean;
}

export const useCompareStore = create<CompareStoreState>((set, get) => ({
  selectedPlanIds: [],
  activeCategoryId: null,

  addPlan: (planId, categoryId) => {
    const { selectedPlanIds, activeCategoryId } = get();

    // Check if already in list
    if (selectedPlanIds.includes(planId)) {
      return { success: false, message: 'Plan is already added to comparison.' };
    }

    // Check max capacity (max 4 plans)
    if (selectedPlanIds.length >= 4) {
      return { success: false, message: 'You can compare up to 4 plans at a time.' };
    }

    // Check category compatibility
    if (activeCategoryId && activeCategoryId !== categoryId) {
      return {
        success: false,
        message: 'You can only compare plans within the same insurance category.',
      };
    }

    set({
      selectedPlanIds: [...selectedPlanIds, planId],
      activeCategoryId: categoryId,
    });
    return { success: true };
  },

  removePlan: (planId) => {
    const nextList = get().selectedPlanIds.filter((id) => id !== planId);
    set({
      selectedPlanIds: nextList,
      activeCategoryId: nextList.length === 0 ? null : get().activeCategoryId,
    });
  },

  clearCompare: () => {
    set({ selectedPlanIds: [], activeCategoryId: null });
  },

  isInCompare: (planId) => {
    return get().selectedPlanIds.includes(planId);
  },
}));
