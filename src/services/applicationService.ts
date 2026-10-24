import { apiClient } from './apiClient';
import { storage } from '../utils/storage';
import { ApplicationDraft, InsuranceApplication } from '../types/insurance';
import { demoUserApplications } from '../data/demoPolicies';

const USE_MOCK = !process.env.EXPO_PUBLIC_API_URL;
const DRAFT_KEY_PREFIX = 'app_draft_';

export const applicationService = {
  /**
   * Save or update an in-progress application draft
   */
  async saveDraft(draft: ApplicationDraft): Promise<void> {
    const key = `${DRAFT_KEY_PREFIX}${draft.id}`;
    await storage.setItem(key, draft);

    // Also update draft index list
    const existingIndex = (await storage.getItem<string[]>('active_draft_ids')) || [];
    if (!existingIndex.includes(draft.id)) {
      await storage.setItem('active_draft_ids', [...existingIndex, draft.id]);
    }
  },

  /**
   * Retrieve an application draft by ID
   */
  async getDraft(draftId: string): Promise<ApplicationDraft | null> {
    return await storage.getItem<ApplicationDraft>(`${DRAFT_KEY_PREFIX}${draftId}`);
  },

  /**
   * Delete draft upon submission or cancellation
   */
  async deleteDraft(draftId: string): Promise<void> {
    await storage.removeItem(`${DRAFT_KEY_PREFIX}${draftId}`);
    const existingIndex = (await storage.getItem<string[]>('active_draft_ids')) || [];
    await storage.setItem(
      'active_draft_ids',
      existingIndex.filter((id) => id !== draftId)
    );
  },

  /**
   * Submit application to backend service
   */
  async submitApplication(draft: ApplicationDraft): Promise<InsuranceApplication> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const submission: InsuranceApplication = {
        ...draft,
        applicationId: `app_${Date.now()}`,
        applicationNumber: `IN-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        estimatedDecisionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        remarks: 'Your application has been received and forwarded to underwriting for verification.',
      };

      // Store in user submitted list
      const stored = (await storage.getItem<InsuranceApplication[]>('submitted_applications')) || [];
      await storage.setItem('submitted_applications', [submission, ...stored]);
      await applicationService.deleteDraft(draft.id);

      return submission;
    }

    const response = await apiClient.post<InsuranceApplication>('/insurance/applications', draft);
    await applicationService.deleteDraft(draft.id);
    return response.data;
  },

  /**
   * Fetch submitted applications for current authenticated user
   */
  async getUserApplications(): Promise<InsuranceApplication[]> {
    if (USE_MOCK) {
      const stored = (await storage.getItem<InsuranceApplication[]>('submitted_applications')) || [];
      return [...stored, ...demoUserApplications];
    }
    const response = await apiClient.get<InsuranceApplication[]>('/insurance/applications');
    return response.data;
  },
};


