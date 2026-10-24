import { create } from 'zustand';
import { demoPlans } from '../data/demoPlans';
import { InsurancePlan } from '../types/insurance';

interface RecentlyExploredState {
  exploredPlanIds: string[];
  addExploredPlan: (planId: string) => void;
  clearExplored: () => void;
  getExploredPlans: () => InsurancePlan[];
}

// Pre-populate with a few popular plans so user immediately sees explored plans
const DEFAULT_EXPLORED_IDS = [
  'health-care-supreme',
  'life-hdfc-click2protect',
  'motor-digit-comprehensive',
  'travel-tata-aig-explore',
];

export const useRecentlyExploredStore = create<RecentlyExploredState>((set, get) => ({
  exploredPlanIds: DEFAULT_EXPLORED_IDS,

  addExploredPlan: (planId: string) => {
    set((state) => {
      const filtered = state.exploredPlanIds.filter((id) => id !== planId);
      return {
        exploredPlanIds: [planId, ...filtered].slice(0, 8),
      };
    });
  },

  clearExplored: () => {
    set({ exploredPlanIds: [] });
  },

  getExploredPlans: () => {
    const ids = get().exploredPlanIds;
    return ids
      .map((id) => demoPlans.find((p) => p.id === id))
      .filter((p): p is InsurancePlan => !!p);
  },
}));
