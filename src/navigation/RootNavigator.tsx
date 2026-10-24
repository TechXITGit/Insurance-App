import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

// Tabs
import { BottomTabNavigator } from './BottomTabNavigator';

// Screens
import { CategoryLandingScreen } from '../screens/category/CategoryLandingScreen';
import { PlanDetailsScreen } from '../screens/plan/PlanDetailsScreen';
import { PlanComparisonScreen } from '../screens/plan/PlanComparisonScreen';
import { SearchResultsScreen } from '../screens/search/SearchResultsScreen';
import { QuoteEligibilityScreen } from '../screens/quote/QuoteEligibilityScreen';

// Auth
import { LoginScreen } from '../screens/auth/LoginScreen';
import { CreateAccountScreen } from '../screens/auth/CreateAccountScreen';
import { OtpVerificationScreen } from '../screens/auth/OtpVerificationScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';

// Applications
import { ApplicationFormScreen } from '../screens/application/ApplicationFormScreen';
import { ApplicationReviewScreen } from '../screens/application/ApplicationReviewScreen';
import { ApplicationConfirmationScreen } from '../screens/application/ApplicationConfirmationScreen';
import { KycVerificationScreen } from '../screens/kyc/KycVerificationScreen';

// Policies & Portability
import { PolicyDetailsScreen } from '../screens/policies/PolicyDetailsScreen';
import { RenewPolicyScreen } from '../screens/policies/RenewPolicyScreen';
import { PortExistingPolicyScreen } from '../screens/policies/PortExistingPolicyScreen';

// Inquiries
import { GroupInsuranceInquiryScreen } from '../screens/inquiries/GroupInsuranceInquiryScreen';
import { CorporateInsuranceInquiryScreen } from '../screens/inquiries/CorporateInsuranceInquiryScreen';

// Profile & Help
import { SavedPlansScreen } from '../screens/profile/SavedPlansScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { HelpGlossaryScreen } from '../screens/help/HelpGlossaryScreen';
import { ContactSupportScreen } from '../screens/help/ContactSupportScreen';
import { NotificationCenterScreen } from '../screens/notifications/NotificationCenterScreen';

// Legal
import { TermsAndConditionsScreen } from '../screens/legal/TermsAndConditionsScreen';
import { PrivacyPolicyScreen } from '../screens/legal/PrivacyPolicyScreen';
import { SplashScreen } from '../screens/splash/SplashScreen';
import { InsuredOnboardingScreen } from '../screens/onboarding/InsuredOnboardingScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {/* 1. Branded Splash Screen */}
      <Stack.Screen name="Splash" component={SplashScreen} />

      {/* 2. Full-Page Onboarding Intake (immediately after splash screen) */}
      <Stack.Screen name="InsuredOnboarding" component={InsuredOnboardingScreen} />

      {/* 5 Bottom Tabs */}
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />

      {/* Discovery & Plan Evaluation */}
      <Stack.Screen name="CategoryLanding" component={CategoryLandingScreen} />
      <Stack.Screen name="PlanDetails" component={PlanDetailsScreen} />
      <Stack.Screen name="PlanComparison" component={PlanComparisonScreen} />
      <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
      <Stack.Screen name="QuoteEligibility" component={QuoteEligibilityScreen} />

      {/* Auth Flows */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

      {/* Application Journey & KYC */}
      <Stack.Screen name="KycVerification" component={KycVerificationScreen} />
      <Stack.Screen name="ApplicationForm" component={ApplicationFormScreen} />
      <Stack.Screen name="ApplicationReview" component={ApplicationReviewScreen} />
      <Stack.Screen name="ApplicationConfirmation" component={ApplicationConfirmationScreen} />

      {/* Policy Management & Actions */}
      <Stack.Screen name="PolicyDetails" component={PolicyDetailsScreen} />
      <Stack.Screen name="RenewPolicy" component={RenewPolicyScreen} />
      <Stack.Screen name="PortExistingPolicy" component={PortExistingPolicyScreen} />

      {/* Inquiries */}
      <Stack.Screen name="GroupInsuranceInquiry" component={GroupInsuranceInquiryScreen} />
      <Stack.Screen name="CorporateInsuranceInquiry" component={CorporateInsuranceInquiryScreen} />

      {/* Profile & Saved Plans */}
      <Stack.Screen name="SavedPlans" component={SavedPlansScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />

      {/* Help, Support & Notifications */}
      <Stack.Screen name="HelpGlossary" component={HelpGlossaryScreen} />
      <Stack.Screen name="ContactSupport" component={ContactSupportScreen} />
      <Stack.Screen name="NotificationCenter" component={NotificationCenterScreen} />

      {/* Legal & Compliance */}
      <Stack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </Stack.Navigator>
  );
};
