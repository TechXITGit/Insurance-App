import { NavigatorScreenParams } from '@react-navigation/native';
import { CategoryId } from './insurance';

export type MainTabParamList = {
  HomeTab: undefined;
  ExploreTab: { categoryId?: CategoryId; policyType?: string } | undefined;
  MyPoliciesTab: { initialTab?: 'policies' | 'applications' | 'portability' } | undefined;
  HelpTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  InsuredOnboarding: { isEditing?: boolean } | undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  CategoryLanding: { categoryId: CategoryId };
  PlanDetails: { planId: string };
  PlanComparison: { planIds?: string[]; categoryId?: CategoryId };
  SearchResults: { query?: string; categoryId?: CategoryId };
  QuoteEligibility: { categoryId: CategoryId; planId?: string };
  Login: { returnScreen?: keyof RootStackParamList; returnParams?: Record<string, any> };
  CreateAccount: { returnScreen?: keyof RootStackParamList; returnParams?: Record<string, any> };
  OtpVerification: { phone: string; isNewUser?: boolean; returnScreen?: keyof RootStackParamList; returnParams?: Record<string, any> };
  ForgotPassword: undefined;
  KycVerification: { returnScreen?: keyof RootStackParamList; returnParams?: Record<string, any> } | undefined;
  ApplicationForm: { planId: string; draftId?: string };
  ApplicationReview: { draftId: string };
  ApplicationConfirmation: { applicationId: string; applicationNumber?: string };
  PolicyDetails: { policyId: string };
  RenewPolicy: { prefilledPolicyNumber?: string; categoryId?: CategoryId };
  PortExistingPolicy: { draftId?: string };
  GroupInsuranceInquiry: undefined;
  CorporateInsuranceInquiry: undefined;
  SavedPlans: undefined;
  HelpGlossary: undefined;
  ContactSupport: undefined;
  EditProfile: undefined;
  NotificationCenter: undefined;
  TermsAndConditions: undefined;
  PrivacyPolicy: undefined;
};
