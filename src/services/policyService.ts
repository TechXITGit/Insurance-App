import { apiClient } from './apiClient';
import { storage } from '../utils/storage';
import { PolicySummary, RenewalRequest, PortabilityRequest } from '../types/insurance';
import { demoUserPolicies } from '../data/demoPolicies';

const USE_MOCK = !process.env.EXPO_PUBLIC_API_URL;

export const policyService = {
  /**
   * Fetch all policies associated with authenticated user
   */
  async getUserPolicies(): Promise<PolicySummary[]> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const renewedPolicies = (await storage.getItem<PolicySummary[]>('user_renewed_policies')) || [];
      return [...renewedPolicies, ...demoUserPolicies];
    }
    const response = await apiClient.get<PolicySummary[]>('/policies');
    return response.data;
  },

  /**
   * Get single policy by ID
   */
  async getPolicyById(policyId: string): Promise<PolicySummary | undefined> {
    const policies = await policyService.getUserPolicies();
    return policies.find((p) => p.policyId === policyId);
  },

  /**
   * Fetch and verify existing policy from authorized insurer integration
   */
  async verifyPolicyForRenewal(
    policyNumber: string,
    insurerName: string,
    phone: string
  ): Promise<{
    verified: boolean;
    policyNumber: string;
    insurerName: string;
    holderName: string;
    currentSumInsured: number;
    expiryDate: string;
    renewalPremium: number;
    ncbPercentage: number;
    message: string;
  }> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        verified: true,
        policyNumber,
        insurerName,
        holderName: 'Aarav Mehta',
        currentSumInsured: 1000000,
        expiryDate: '2026-11-19',
        renewalPremium: 11450,
        ncbPercentage: 20,
        message: 'Policy verified successfully via Insurer API integration (Mock).',
      };
    }
    const response = await apiClient.post('/policies/verify-renewal', {
      policyNumber,
      insurerName,
      phone,
    });
    return response.data;
  },

  /**
   * Complete verified policy renewal
   */
  async submitRenewal(renewal: RenewalRequest): Promise<RenewalRequest> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const completedRenewal: RenewalRequest = {
        ...renewal,
        id: `ren_${Date.now()}`,
        status: 'renewed',
        transactionId: `TXN-UPI-${Math.floor(10000000 + Math.random() * 90000000)}`,
        submittedAt: new Date().toISOString(),
        notes: 'Demo renewal transaction completed. Verified policy certificate issued.',
      };

      const existingRenewals = (await storage.getItem<RenewalRequest[]>('user_renewals')) || [];
      await storage.setItem('user_renewals', [completedRenewal, ...existingRenewals]);
      return completedRenewal;
    }

    const response = await apiClient.post<RenewalRequest>('/policies/renew', renewal);
    return response.data;
  },

  /**
   * Submit portability request for health policy
   */
  async submitPortability(portability: PortabilityRequest): Promise<PortabilityRequest> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 900));
      const submitted: PortabilityRequest = {
        ...portability,
        id: `port_${Date.now()}`,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        transferCreditsSummary: 'Continuity credits for 36 months PED waiting period submitted for approval.',
      };

      const existing = (await storage.getItem<PortabilityRequest[]>('user_portabilities')) || [];
      await storage.setItem('user_portabilities', [submitted, ...existing]);
      return submitted;
    }

    const response = await apiClient.post<PortabilityRequest>('/policies/portability', portability);
    return response.data;
  },

  /**
   * Fetch submitted portability requests
   */
  async getPortabilityRequests(): Promise<PortabilityRequest[]> {
    if (USE_MOCK) {
      return (await storage.getItem<PortabilityRequest[]>('user_portabilities')) || [];
    }
    const response = await apiClient.get<PortabilityRequest[]>('/policies/portability');
    return response.data;
  },
};
