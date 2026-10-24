import { create } from 'zustand';
import { ApplicationDraft, CategoryId, InsuredMemberInput } from '../types/insurance';
import { applicationService } from '../services/applicationService';

interface ApplicationDraftState {
  currentDraft: ApplicationDraft | null;
  activeStep: number;

  // Actions
  initDraft: (
    planId: string,
    planName: string,
    categoryId: CategoryId,
    sumInsured: number,
    annualPremium: number
  ) => ApplicationDraft;
  loadDraft: (draftId: string) => Promise<boolean>;
  updateApplicant: (applicant: Partial<ApplicationDraft['applicant']>) => void;
  updateInsuredMembers: (members: InsuredMemberInput[]) => void;
  updateCoverageDetails: (details: {
    sumInsured?: number;
    selectedTenureYears?: number;
    selectedRiders?: string[];
    annualPremium?: number;
  }) => void;
  updateExistingPolicy: (hasPolicy: boolean, policyNumber?: string, insurer?: string) => void;
  setConsent: (agreed: boolean) => void;
  setStep: (step: number) => void;
  saveCurrentDraft: () => Promise<void>;
  resetDraft: () => void;
}

const createInitialDraft = (
  planId: string,
  planName: string,
  categoryId: CategoryId,
  sumInsured: number,
  annualPremium: number
): ApplicationDraft => ({
  id: `draft_${Date.now()}`,
  planId,
  planName,
  categoryId,
  sumInsured,
  selectedTenureYears: 1,
  selectedRiders: [],
  annualPremium,
  step: 1,
  applicant: {
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'male',
    pincode: '',
    city: '',
    state: '',
    addressLine1: '',
    panNumber: '',
  },
  insuredMembers: [
    {
      fullName: '',
      relation: 'self',
      dateOfBirth: '',
      gender: 'male',
      hasPreExistingConditions: false,
    },
  ],
  hasExistingPolicy: false,
  consentAgreed: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const useApplicationDraftStore = create<ApplicationDraftState>((set, get) => ({
  currentDraft: null,
  activeStep: 1,

  initDraft: (planId, planName, categoryId, sumInsured, annualPremium) => {
    const newDraft = createInitialDraft(planId, planName, categoryId, sumInsured, annualPremium);
    set({ currentDraft: newDraft, activeStep: 1 });
    applicationService.saveDraft(newDraft);
    return newDraft;
  },

  loadDraft: async (draftId: string) => {
    const draft = await applicationService.getDraft(draftId);
    if (draft) {
      set({ currentDraft: draft, activeStep: draft.step });
      return true;
    }
    return false;
  },

  updateApplicant: (applicantUpdates) => {
    const draft = get().currentDraft;
    if (!draft) return;
    const updatedDraft: ApplicationDraft = {
      ...draft,
      applicant: {
        ...draft.applicant,
        ...applicantUpdates,
      },
      updatedAt: new Date().toISOString(),
    };
    set({ currentDraft: updatedDraft });
    applicationService.saveDraft(updatedDraft);
  },

  updateInsuredMembers: (members) => {
    const draft = get().currentDraft;
    if (!draft) return;
    const updatedDraft: ApplicationDraft = {
      ...draft,
      insuredMembers: members,
      updatedAt: new Date().toISOString(),
    };
    set({ currentDraft: updatedDraft });
    applicationService.saveDraft(updatedDraft);
  },

  updateCoverageDetails: (details) => {
    const draft = get().currentDraft;
    if (!draft) return;
    const updatedDraft: ApplicationDraft = {
      ...draft,
      sumInsured: details.sumInsured ?? draft.sumInsured,
      selectedTenureYears: details.selectedTenureYears ?? draft.selectedTenureYears,
      selectedRiders: details.selectedRiders ?? draft.selectedRiders,
      annualPremium: details.annualPremium ?? draft.annualPremium,
      updatedAt: new Date().toISOString(),
    };
    set({ currentDraft: updatedDraft });
    applicationService.saveDraft(updatedDraft);
  },

  updateExistingPolicy: (hasPolicy, policyNumber, insurer) => {
    const draft = get().currentDraft;
    if (!draft) return;
    const updatedDraft: ApplicationDraft = {
      ...draft,
      hasExistingPolicy: hasPolicy,
      existingPolicyNumber: policyNumber,
      existingInsurer: insurer,
      updatedAt: new Date().toISOString(),
    };
    set({ currentDraft: updatedDraft });
    applicationService.saveDraft(updatedDraft);
  },

  setConsent: (agreed) => {
    const draft = get().currentDraft;
    if (!draft) return;
    const updatedDraft: ApplicationDraft = {
      ...draft,
      consentAgreed: agreed,
      updatedAt: new Date().toISOString(),
    };
    set({ currentDraft: updatedDraft });
    applicationService.saveDraft(updatedDraft);
  },

  setStep: (step) => {
    set({ activeStep: step });
    const draft = get().currentDraft;
    if (draft) {
      const updatedDraft = { ...draft, step, updatedAt: new Date().toISOString() };
      set({ currentDraft: updatedDraft });
      applicationService.saveDraft(updatedDraft);
    }
  },

  saveCurrentDraft: async () => {
    const draft = get().currentDraft;
    if (draft) {
      await applicationService.saveDraft(draft);
    }
  },

  resetDraft: () => {
    set({ currentDraft: null, activeStep: 1 });
  },
}));
