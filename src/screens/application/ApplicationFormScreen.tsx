import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { demoPlans } from '../../data/demoPlans';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { Header } from '../../components/common/Header';
import { StepIndicator } from '../../components/forms/StepIndicator';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useApplicationDraftStore } from '../../store/applicationDraftStore';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency } from '../../utils/formatters';
import { phoneRegex, pincodeRegex } from '../../utils/validation';

import { useKycStore } from '../../store/kycStore';
import { useInsuredProfileStore } from '../../store/insuredProfileStore';

type AppFormRouteProp = RouteProp<RootStackParamList, 'ApplicationForm'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ApplicationFormScreen: React.FC = () => {
  const route = useRoute<AppFormRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { planId } = route.params;

  const { user } = useAuthStore();
  const { isVerified, kycData } = useKycStore();
  const { profile: insuredProfile } = useInsuredProfileStore();
  const {
    currentDraft,
    activeStep,
    initDraft,
    updateApplicant,
    updateInsuredMembers,
    updateCoverageDetails,
    setConsent,
    setStep,
    saveCurrentDraft,
  } = useApplicationDraftStore();

  const plan = demoPlans.find((p) => p.id === planId) || demoPlans[0];

  // Initialize draft if not exists or different plan
  useEffect(() => {
    if (!currentDraft || currentDraft.planId !== plan.id) {
      initDraft(plan.id, plan.name, plan.categoryId, plan.baseSumInsured, plan.basePremium);
    }
  }, [planId]);

  // Form local state
  // Step 1: Coverage
  const [sumInsured, setSumInsured] = useState(currentDraft?.sumInsured || plan.baseSumInsured);
  const [tenure, setTenure] = useState(currentDraft?.selectedTenureYears || 1);

  // Step 2: Applicant details
  const [fullName, setFullName] = useState(
    currentDraft?.applicant.fullName || (isVerified && kycData?.fullName) || insuredProfile.fullName || user?.fullName || ''
  );
  const [email, setEmail] = useState(currentDraft?.applicant.email || insuredProfile.email || user?.email || '');
  const [phone, setPhone] = useState(currentDraft?.applicant.phone || insuredProfile.phone || user?.phone || '');
  const [dob, setDob] = useState(currentDraft?.applicant.dob || (isVerified && kycData?.dob) || '');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(
    currentDraft?.applicant.gender || (isVerified && kycData?.gender) || insuredProfile.gender || 'male'
  );
  const [pincode, setPincode] = useState(
    currentDraft?.applicant.pincode || (isVerified && kycData?.pincode) || insuredProfile.pincode || user?.pincode || ''
  );
  const [city, setCity] = useState(
    currentDraft?.applicant.city || (isVerified && kycData?.city) || insuredProfile.city || user?.city || ''
  );
  const [addressLine, setAddressLine] = useState(
    currentDraft?.applicant.addressLine1 || (isVerified && kycData?.addressLine) || ''
  );
  const [panNumber, setPanNumber] = useState(
    currentDraft?.applicant.panNumber || (isVerified && kycData?.panNumber) || ''
  );

  // Prefill from verified KYC if KYC state activates
  useEffect(() => {
    if (isVerified && kycData) {
      if (!fullName && kycData.fullName) setFullName(kycData.fullName);
      if (!panNumber && kycData.panNumber) setPanNumber(kycData.panNumber);
      if (!dob && kycData.dob) setDob(kycData.dob);
      if (kycData.gender) setGender(kycData.gender);
      if (!addressLine && kycData.addressLine) setAddressLine(kycData.addressLine);
      if (!city && kycData.city) setCity(kycData.city);
      if (!pincode && kycData.pincode) setPincode(kycData.pincode);
    }
  }, [isVerified, kycData]);

  // Step 3: Insured members
  const [insuredMembersCount, setInsuredMembersCount] = useState(1);
  const [hasPed, setHasPed] = useState(
    currentDraft?.insuredMembers?.[0]?.hasPreExistingConditions ?? insuredProfile.hasPreExistingConditions ?? false
  );
  const [pedDetails, setPedDetails] = useState(
    currentDraft?.insuredMembers?.[0]?.details || insuredProfile.preExistingDetails || ''
  );

  // Step 4: Category specific (Travel/Health/Term)
  const [travelDestination, setTravelDestination] = useState('');
  const [travelDates, setTravelDates] = useState('');
  const [annualIncome, setAnnualIncome] = useState('');

  // Step 5: Declarations
  const [declarationAgreed, setDeclarationAgreed] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const TOTAL_STEPS = 5;

  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {};

    if (step === 2) {
      if (!fullName.trim() || fullName.length < 2) errs.fullName = 'Full name is required';
      if (!email.trim() || !email.includes('@')) errs.email = 'Valid email is required';
      const cleanPhone = phone.trim().replace(/\D/g, '');
      if (!cleanPhone || !phoneRegex.test(cleanPhone)) errs.phone = 'Valid 10-digit mobile is required';
      if (!pincode.trim() || !pincodeRegex.test(pincode)) errs.pincode = 'Valid 6-digit PIN code is required';
      if (!city.trim()) errs.city = 'City is required';
    } else if (step === 5) {
      if (!declarationAgreed) {
        errs.declaration = 'You must accept the truthfulness declaration and IRDAI Section 45 terms';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(activeStep)) return;

    // Persist step state into draft
    if (activeStep === 1) {
      updateCoverageDetails({
        sumInsured,
        selectedTenureYears: tenure,
        annualPremium: Math.round(plan.basePremium * Math.sqrt(sumInsured / plan.baseSumInsured) * tenure),
      });
    } else if (activeStep === 2) {
      updateApplicant({
        fullName,
        email,
        phone,
        dob,
        gender,
        pincode,
        city,
        state: 'Delhi',
        addressLine1: addressLine,
        panNumber,
      });
    } else if (activeStep === 3) {
      updateInsuredMembers([
        {
          fullName: fullName || insuredProfile.fullName || user?.fullName || 'Insured Applicant',
          relation: 'self',
          dateOfBirth: dob,
          gender,
          hasPreExistingConditions: hasPed,
          details: pedDetails,
        },
      ]);
    } else if (activeStep === 5) {
      setConsent(declarationAgreed);
      if (currentDraft) {
        navigation.navigate('ApplicationReview', { draftId: currentDraft.id });
        return;
      }
    }

    if (activeStep < TOTAL_STEPS) {
      setStep(activeStep + 1);
    }
  };

  const handleBack = async () => {
    if (activeStep > 1) {
      setStep(activeStep - 1);
    } else {
      // Save draft silently and smoothly go back
      try {
        await saveCurrentDraft();
      } catch {
        // silent fallback
      }
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('MainTabs', { screen: 'ExploreTab' } as any);
      }
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1:
        return 'Coverage & Tenure';
      case 2:
        return 'Applicant Details';
      case 3:
        return 'Insured Members & Medical';
      case 4:
        return 'Category Details';
      case 5:
        return 'Declarations & Consent';
      default:
        return 'Application';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={`Apply: ${plan.name}`}
        showBack={true}
        onBackPress={handleBack}
        rightAction={
          <TouchableOpacity
            onPress={async () => {
              await saveCurrentDraft();
              Alert.alert('Draft Saved', 'Your application draft has been saved successfully.');
            }}
            style={styles.saveDraftBtn}
          >
            <Text style={styles.saveDraftText}>Save Draft</Text>
          </TouchableOpacity>
        }
      />

      <StepIndicator
        currentStep={activeStep}
        totalSteps={TOTAL_STEPS}
        title={getStepTitle(activeStep)}
        subtitle={`Plan: ${plan.name} (${plan.providerName})`}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* STEP 1: Coverage & Tenure */}
          {activeStep === 1 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Choose Sum Insured Tier</Text>
              <Text style={styles.cardSub}>Select the maximum medical coverage per policy year</Text>
              <View style={styles.optionsWrap}>
                {plan.sumInsuredOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => setSumInsured(opt)}
                    style={[styles.optChip, sumInsured === opt && styles.optChipActive]}
                  >
                    <Text style={[styles.optChipText, sumInsured === opt && styles.optChipTextActive]}>
                      {formatCurrency(opt, true)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.cardTitle, { marginTop: spacing.lg }]}>Policy Tenure</Text>
              <View style={styles.tenureRow}>
                {plan.policyTermsYears.map((yr) => (
                  <TouchableOpacity
                    key={yr}
                    onPress={() => setTenure(yr)}
                    style={[styles.tenureBtn, tenure === yr && styles.tenureBtnActive]}
                  >
                    <Text style={[styles.tenureBtnText, tenure === yr && styles.tenureBtnTextActive]}>
                      {yr} Year{yr > 1 ? 's' : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.priceEstimateCard}>
                <Text style={styles.priceEstimateLabel}>Indicative Base Premium</Text>
                <Text style={styles.priceEstimateValue}>
                  {formatCurrency(
                    Math.round(plan.basePremium * Math.sqrt(sumInsured / plan.baseSumInsured) * tenure)
                  )}
                </Text>
                <Text style={styles.priceEstimateGst}>+ 18% GST (Calculated at final step)</Text>
              </View>
            </View>
          )}

          {/* STEP 2: Applicant Details */}
          {activeStep === 2 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Primary Proposer Details</Text>
              <Text style={styles.cardSub}>Information as appears on Government Identification documents</Text>

              {isVerified ? (
                <View style={styles.kycPrefilledBanner}>
                  <Ionicons name="shield-checkmark" size={18} color={colors.success} />
                  <Text style={styles.kycPrefilledText}>
                    Verified CKYC Data: Proposer details prefilled from your central KYC profile.
                  </Text>
                </View>
              ) : null}

              <Input
                label="Full Legal Name"
                value={fullName}
                onChangeText={setFullName}
                placeholder="e.g. Rahul Sharma"
                error={errors.fullName}
              />

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: spacing.sm }}>
                  <Input
                    label="Mobile Number"
                    prefix="+91"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    maxLength={10}
                    error={errors.phone}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Date of Birth"
                    value={dob}
                    onChangeText={setDob}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
              </View>

              <Input
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="name@example.com"
                error={errors.email}
              />

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: spacing.sm }}>
                  <Input
                    label="PIN Code"
                    value={pincode}
                    onChangeText={setPincode}
                    keyboardType="numeric"
                    maxLength={6}
                    error={errors.pincode}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="City"
                    value={city}
                    onChangeText={setCity}
                    error={errors.city}
                  />
                </View>
              </View>

              <Input
                label="Residential Address"
                value={addressLine}
                onChangeText={setAddressLine}
                placeholder="House / Flat No, Street"
              />

              <Input
                label="PAN Card Number (for IRDAI KYC)"
                value={panNumber}
                onChangeText={(val) => setPanNumber(val.toUpperCase())}
                autoCapitalize="characters"
                maxLength={10}
                placeholder="ABCDE1234F"
              />
            </View>
          )}

          {/* STEP 3: Insured Members & Medical Declarations */}
          {activeStep === 3 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Proposed Insured Members</Text>
              <Text style={styles.cardSub}>Disclose existing illnesses accurately for seamless claim approval</Text>

              <View style={styles.memberBox}>
                <View style={styles.memberHeader}>
                  <Text style={styles.memberTitle}>Primary Insured: {fullName || insuredProfile.fullName || user?.fullName || 'Insured Applicant'}</Text>
                  <Text style={styles.memberRelation}>
                    Relation: {insuredProfile.relation ? insuredProfile.relation.toUpperCase() : 'SELF'}
                  </Text>
                </View>

                {/* Pre-existing diseases checkbox */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    const nextVal = !hasPed;
                    setHasPed(nextVal);
                    if (!nextVal) setPedDetails('');
                  }}
                  style={[styles.pedCheckboxRow, hasPed && styles.pedCheckboxRowActive]}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: hasPed }}
                >
                  <View style={[styles.checkboxSquare, hasPed && styles.checkboxSquareChecked]}>
                    {hasPed && <Ionicons name="checkmark" size={16} color={colors.white} />}
                  </View>

                  <View style={{ flex: 1, marginLeft: spacing.sm }}>
                    <Text style={styles.pedLabel}>Any Pre-existing Medical Conditions?</Text>
                    <Text style={styles.pedSub}>
                      Diabetes, Hypertension, Heart disease, Asthma, Thyroid, or prior surgeries
                    </Text>
                  </View>
                </TouchableOpacity>

                {hasPed && (
                  <View style={styles.pedDetailsInputWrap}>
                    <Input
                      label="Please specify medical condition and medication details"
                      value={pedDetails}
                      onChangeText={setPedDetails}
                      placeholder="e.g. Type 2 Diabetes since 2021, taking Metformin 500mg daily"
                      multiline={true}
                      style={{ minHeight: 68 }}
                    />
                  </View>
                )}
              </View>

              <View style={styles.guidanceBox}>
                <MaterialCommunityIcons name="shield-alert-outline" size={20} color={colors.primaryBlue} />
                <Text style={styles.guidanceText}>
                  Section 45 of Insurance Act: Transparent medical disclosure ensures your future hospitalization claims are never disputed by the insurer.
                </Text>
              </View>
            </View>
          )}

          {/* STEP 4: Category Specific Questions */}
          {activeStep === 4 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{plan.categoryName} Specific Details</Text>
              <Text style={styles.cardSub}>Tailored questions for underwriting verification</Text>

              {plan.categoryId === 'travel' ? (
                <>
                  <Input
                    label="Travel Destination"
                    value={travelDestination}
                    onChangeText={setTravelDestination}
                    placeholder="Country / Countries"
                  />
                  <Input
                    label="Travel Itinerary Dates"
                    value={travelDates}
                    onChangeText={setTravelDates}
                    placeholder="Start date to Return date"
                  />
                </>
              ) : plan.categoryId === 'term_assurance' ? (
                <>
                  <Input
                    label="Annual Gross Income"
                    value={annualIncome}
                    onChangeText={setAnnualIncome}
                    placeholder="e.g. ₹12,00,000"
                  />
                  <Input
                    label="Occupation & Industry"
                    value="Software Engineer - IT Services"
                    placeholder="e.g. Doctor, Architect, Salaried"
                  />
                </>
              ) : (
                <>
                  <Input
                    label="Existing Health Policy (if any for Portability/Continuity)"
                    placeholder="Insurer Name or Policy No (Leave blank if none)"
                  />
                  <Input
                    label="Preferred Hospital Network Tier"
                    value="All Network Hospitals (11,000+ Cashless Centers)"
                    editable={false}
                  />
                </>
              )}
            </View>
          )}

          {/* STEP 5: Declarations & Consent */}
          {activeStep === 5 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Declarations & Consent</Text>
              <Text style={styles.cardSub}>IRDAI statutory disclosure and policy terms agreement</Text>

              <View style={styles.declarationBox}>
                <Text style={styles.declarationText}>
                  1. I hereby declare that all statements and answers given above are complete, true, and correct to the best of my knowledge.{'\n\n'}
                  2. I understand that any non-disclosure or misrepresentation of material facts can void the insurance contract and lead to forfeiture of benefits as per Section 45 of the Insurance Act, 1938.{'\n\n'}
                  3. I consent to InsureEase securely transmitting this application data to the designated insurer ({plan.providerName}) for underwriting evaluation.
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setDeclarationAgreed(!declarationAgreed)}
                style={styles.consentRow}
              >
                <Ionicons
                  name={declarationAgreed ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={declarationAgreed ? colors.primaryBlue : colors.textMuted}
                />
                <Text style={styles.consentText}>
                  I confirm the declarations above and agree to proceed to application review.
                </Text>
              </TouchableOpacity>
              {errors.declaration ? <Text style={styles.errorText}>{errors.declaration}</Text> : null}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Nav Bar: Back and Continue */}
      <View style={styles.bottomNav}>
        <Button
          title={activeStep === 1 ? 'Cancel' : 'Previous'}
          onPress={handleBack}
          variant="outline"
          size="md"
          style={styles.navBtn}
        />

        <Button
          title={activeStep === TOTAL_STEPS ? 'Review Application' : 'Continue'}
          onPress={handleNext}
          variant="primary"
          size="md"
          rightIcon={<Ionicons name="arrow-forward" size={16} color={colors.white} />}
          style={styles.navBtn}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
  },
  saveDraftBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  saveDraftText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryBlue,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 90,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.primaryNavy,
  },
  cardSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
  },
  optChipActive: {
    backgroundColor: colors.primaryBlue,
    borderColor: colors.primaryBlue,
  },
  optChipText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  optChipTextActive: {
    color: colors.white,
  },
  tenureRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tenureBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
  },
  tenureBtnActive: {
    backgroundColor: colors.primaryNavy,
    borderColor: colors.primaryNavy,
  },
  tenureBtnText: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  tenureBtnTextActive: {
    color: colors.white,
  },
  priceEstimateCard: {
    backgroundColor: colors.lightBlueBg,
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  priceEstimateLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  priceEstimateValue: {
    ...typography.h2,
    color: colors.primaryNavy,
    marginTop: 2,
  },
  priceEstimateGst: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
  },
  row: {
    flexDirection: 'row',
  },
  memberBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  memberTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  memberRelation: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  pedCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.sm + 2,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceSubtle,
    marginVertical: spacing.xs,
  },
  pedCheckboxRowActive: {
    borderColor: colors.primaryBlue,
    backgroundColor: '#F0F7FF',
  },
  checkboxSquare: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.textMuted,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxSquareChecked: {
    backgroundColor: colors.primaryBlue,
    borderColor: colors.primaryBlue,
  },
  pedLabel: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  pedSub: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  pedDetailsInputWrap: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  guidanceBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.lightBlueBg,
    borderRadius: radii.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  guidanceText: {
    ...typography.caption,
    color: colors.primaryNavy,
    flex: 1,
    lineHeight: 16,
  },
  declarationBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  declarationText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  consentText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 18,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    gap: spacing.md,
  },
  navBtn: {
    flex: 1,
  },
  kycPrefilledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: radii.md,
    padding: spacing.sm,
    gap: 8,
    marginBottom: spacing.md,
  },
  kycPrefilledText: {
    ...typography.caption,
    color: '#166534',
    fontWeight: '600',
    flex: 1,
  },
});
