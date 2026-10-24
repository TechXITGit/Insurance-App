export type CategoryId =
  | 'health'
  | 'travel'
  | 'mediclaim'
  | 'group'
  | 'corporate'
  | 'renew'
  | 'portability'
  | 'endowment'
  | 'whole_life'
  | 'money_back'
  | 'term_assurance'
  | 'riders'
  | 'accident';

export type PolicyType = 'individual' | 'family' | 'senior' | 'group' | 'corporate';

export interface InsuranceCategory {
  id: CategoryId;
  name: string;
  tagline: string;
  shortDescription: string;
  fullDescription: string;
  iconName: string;
  popular: boolean;
  serviceType: 'retail' | 'inquiry' | 'service';
  whoItSuits: string[];
  keyFeatures: string[];
  limitationsAndExclusions: string[];
  requiredDocuments: string[];
  faqs: { question: string; answer: string }[];
  route?: string;
}

export interface InsuranceProvider {
  id: string;
  name: string;
  shortName: string;
  logoUrl?: string;
  claimSettlementRatio?: number; // e.g. 98.4%
  cashlessHospitalsCount?: number;
  isVerifiedPartner: boolean;
  supportPhone?: string;
  supportEmail?: string;
}

export interface CoverageBenefit {
  id: string;
  title: string;
  description: string;
  included: boolean;
  subLimit?: string;
  iconName?: string;
}

export interface PolicyExclusion {
  id: string;
  title: string;
  description: string;
  isPermanent: boolean;
  waitingPeriodMonths?: number;
}

export interface PlanRider {
  id: string;
  name: string;
  description: string;
  premiumAmount: number;
  coverageDetails: string;
}

export interface InsurancePlan {
  id: string;
  name: string;
  providerId: string;
  providerName: string;
  providerLogo?: string;
  categoryId: CategoryId;
  categoryName: string;
  policyType: PolicyType;
  shortDescription: string;
  overview: string;
  sumInsuredOptions: number[]; // in INR e.g. [500000, 1000000, 2500000, 5000000]
  baseSumInsured: number;
  basePremium: number; // yearly in INR
  premiumFrequency: 'monthly' | 'quarterly' | 'yearly';
  claimSettlementRatio: number; // e.g. 98.6%
  cashlessHospitalsCount?: number;
  networkGaragesCount?: number;
  waitingPeriodGeneralMonths: number;
  waitingPeriodPreExistingMonths: number;
  roomRentLimit: string; // e.g. "No Sub-limit (Single Private Room)"
  copayPercentage: number; // e.g. 0% or 10%
  restorationBenefit: string; // e.g. "100% automatic unlimited recharge"
  maternityCover: boolean;
  dayCareProceduresCount: number;
  freeHealthCheckup: boolean;
  ayushTreatmentCover: boolean;
  keyBenefits: string[];
  detailedBenefits: CoverageBenefit[];
  exclusions: PolicyExclusion[];
  compatibleRiders: PlanRider[];
  eligibility: {
    minAgeYears: number;
    maxAgeYears: number;
    familyMembersAllowed?: string;
  };
  policyTermsYears: number[];
  claimProcessSummary: string;
  requiredDocuments: string[];
  brochureUrl?: string;
  policyWordingUrl?: string;
  isVerifiedData: boolean;
  isDemoData: boolean;
  lastUpdated: string;
}

export interface QuoteRequest {
  categoryId: CategoryId;
  age: number;
  pincode: string;
  sumInsured: number;
  gender?: 'male' | 'female' | 'other';
  tobaccoUser?: boolean;
  membersCount?: number;
  familyMembers?: { relation: string; age: number }[];
  travelDestination?: string;
  travelStartDate?: string;
  travelEndDate?: string;
  tripType?: 'single' | 'multi';
}

export interface InsuranceQuote {
  planId: string;
  planName: string;
  providerName: string;
  estimatedAnnualPremium: number;
  estimatedMonthlyPremium: number;
  gstAmount: number;
  totalAnnualPayable: number;
  sumInsured: number;
  isIndicative: boolean;
  disclaimer: string;
}

export interface InsuredMemberInput {
  fullName: string;
  relation: 'self' | 'spouse' | 'child' | 'father' | 'mother' | 'other';
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  existingDiseases?: string[];
  hasPreExistingConditions: boolean;
  details?: string;
}

export interface ApplicationDraft {
  id: string;
  planId: string;
  planName: string;
  categoryId: CategoryId;
  sumInsured: number;
  selectedTenureYears: number;
  selectedRiders: string[];
  annualPremium: number;
  step: number;
  applicant: {
    fullName: string;
    email: string;
    phone: string;
    dob: string;
    gender: 'male' | 'female' | 'other';
    pincode: string;
    city: string;
    state: string;
    addressLine1: string;
    panNumber?: string;
  };
  insuredMembers: InsuredMemberInput[];
  categorySpecificData?: Record<string, any>;
  hasExistingPolicy: boolean;
  existingPolicyNumber?: string;
  existingInsurer?: string;
  consentAgreed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InsuranceApplication extends ApplicationDraft {
  applicationId: string;
  applicationNumber: string;
  status: 'submitted' | 'under_review' | 'medical_pending' | 'approved' | 'rejected' | 'issued';
  submittedAt: string;
  estimatedDecisionDate: string;
  remarks?: string;
}

export interface PolicySummary {
  policyId: string;
  policyNumber: string;
  planId: string;
  planName: string;
  providerName: string;
  providerLogo?: string;
  categoryId: CategoryId;
  categoryName: string;
  sumInsured: number;
  annualPremium: number;
  policyStartDate: string;
  policyExpiryDate: string;
  nextRenewalDate: string;
  status: 'active' | 'grace_period' | 'expired' | 'renewal_due';
  insuredMembersCount: number;
  cashlessCardUrl?: string;
  policyDocumentUrl?: string;
  hasClaimInProgress: boolean;
}

export interface RenewalRequest {
  id: string;
  policyNumber: string;
  categoryId: CategoryId;
  insurerName: string;
  previousExpiryDate: string;
  applicantName: string;
  registeredPhone: string;
  renewalPremium: number;
  status: 'verification_pending' | 'verified' | 'paid' | 'renewed';
  transactionId?: string;
  submittedAt: string;
  notes?: string;
}

export interface PortabilityRequest {
  id: string;
  currentInsurer: string;
  policyType: string;
  currentPolicyNumber: string;
  currentSumInsured: number;
  expiryDate: string;
  targetInsurer: string;
  requestedSumInsured: number;
  insuredMembersCount: number;
  claimsInPast3Years: boolean;
  claimDetails?: string;
  applicantName: string;
  applicantPhone: string;
  applicantEmail: string;
  status: 'draft' | 'submitted' | 'under_evaluation' | 'inspection_scheduled' | 'approved' | 'rejected';
  submittedAt: string;
  transferCreditsSummary?: string;
}

export interface GroupInquiryRequest {
  id: string;
  organizationName: string;
  organizationType: 'corporate' | 'startup' | 'ngo' | 'association' | 'educational';
  memberCount: number;
  category: string;
  contactPerson: string;
  businessEmail: string;
  contactNumber: string;
  city: string;
  additionalNotes?: string;
  status: 'received' | 'callback_scheduled' | 'quote_shared';
  submittedAt: string;
}

export interface CorporateInquiryRequest {
  id: string;
  companyName: string;
  employeeCount: number;
  coverageTypes: string[];
  currentInsurer?: string;
  policyRenewalDate?: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  requirementsSummary?: string;
  status: 'received' | 'proposal_in_progress';
  submittedAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: 'policy' | 'claim' | 'renewal' | 'portability' | 'general';
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
}
