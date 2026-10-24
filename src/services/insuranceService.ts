import { apiClient } from './apiClient';
import { insuranceCategories } from '../data/insuranceCategories';
import { demoPlans } from '../data/demoPlans';
import { CategoryId, InsuranceCategory, InsurancePlan } from '../types/insurance';

const USE_MOCK_DATA = !process.env.EXPO_PUBLIC_API_URL;

export interface PlanFilters {
  categoryId?: CategoryId;
  policyType?: string;
  minSumInsured?: number;
  maxSumInsured?: number;
  maxWaitingPeriodMonths?: number;
  providerId?: string;
  search?: string;
  sortBy?: 'relevance' | 'coverage_asc' | 'coverage_desc' | 'price_asc' | 'price_desc' | 'claim_ratio_desc';
}

export const insuranceService = {
  /**
   * Fetch all insurance categories
   */
  async getCategories(): Promise<InsuranceCategory[]> {
    if (USE_MOCK_DATA) {
      return insuranceCategories;
    }
    const response = await apiClient.get<InsuranceCategory[]>('/insurance/categories');
    return response.data;
  },

  /**
   * Fetch single category by ID
   */
  async getCategoryById(id: CategoryId): Promise<InsuranceCategory | undefined> {
    if (USE_MOCK_DATA) {
      return insuranceCategories.find((cat) => cat.id === id);
    }
    const response = await apiClient.get<InsuranceCategory>(`/insurance/categories/${id}`);
    return response.data;
  },

  /**
   * Fetch filtered and sorted plans
   */
  async getPlans(filters: PlanFilters = {}): Promise<InsurancePlan[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let plans = [...demoPlans];

      if (filters.categoryId) {
        plans = plans.filter((p) => p.categoryId === filters.categoryId);
      }

      if (filters.policyType && filters.policyType !== 'all') {
        plans = plans.filter((p) => p.policyType === filters.policyType);
      }

      if (filters.minSumInsured) {
        plans = plans.filter((p) => p.baseSumInsured >= (filters.minSumInsured || 0));
      }

      if (filters.maxSumInsured) {
        plans = plans.filter((p) => p.baseSumInsured <= (filters.maxSumInsured || Infinity));
      }

      if (filters.maxWaitingPeriodMonths !== undefined) {
        plans = plans.filter((p) => p.waitingPeriodPreExistingMonths <= (filters.maxWaitingPeriodMonths || 99));
      }

      if (filters.providerId) {
        plans = plans.filter((p) => p.providerId === filters.providerId);
      }

      if (filters.search && filters.search.trim() !== '') {
        const query = filters.search.toLowerCase().trim();
        plans = plans.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.providerName.toLowerCase().includes(query) ||
            p.categoryName.toLowerCase().includes(query) ||
            p.shortDescription.toLowerCase().includes(query) ||
            p.keyBenefits.some((b) => b.toLowerCase().includes(query))
        );
      }

      // Sort
      if (filters.sortBy === 'price_asc') {
        plans.sort((a, b) => a.basePremium - b.basePremium);
      } else if (filters.sortBy === 'price_desc') {
        plans.sort((a, b) => b.basePremium - a.basePremium);
      } else if (filters.sortBy === 'coverage_desc') {
        plans.sort((a, b) => b.baseSumInsured - a.baseSumInsured);
      } else if (filters.sortBy === 'coverage_asc') {
        plans.sort((a, b) => a.baseSumInsured - b.baseSumInsured);
      } else if (filters.sortBy === 'claim_ratio_desc') {
        plans.sort((a, b) => b.claimSettlementRatio - a.claimSettlementRatio);
      }

      return plans;
    }

    const response = await apiClient.get<InsurancePlan[]>('/insurance/plans', { params: filters });
    return response.data;
  },

  /**
   * Fetch single plan by unique ID
   */
  async getPlanById(planId: string): Promise<InsurancePlan | undefined> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return demoPlans.find((p) => p.id === planId);
    }
    const response = await apiClient.get<InsurancePlan>(`/insurance/plans/${planId}`);
    return response.data;
  },

  /**
   * Fetch multiple plans by IDs for comparison
   */
  async getPlansByIds(planIds: string[]): Promise<InsurancePlan[]> {
    if (USE_MOCK_DATA) {
      return demoPlans.filter((p) => planIds.includes(p.id));
    }
    const response = await apiClient.post<InsurancePlan[]>('/insurance/plans/batch', { ids: planIds });
    return response.data;
  },

  /**
   * Fetch featured plans for Home screen
   */
  async getFeaturedPlans(): Promise<InsurancePlan[]> {
    if (USE_MOCK_DATA) {
      return demoPlans.slice(0, 4);
    }
    const response = await apiClient.get<InsurancePlan[]>('/insurance/plans/featured');
    return response.data;
  },
};
