import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useKycStore } from '../../store/kycStore';
import { useAuthStore } from '../../store/authStore';
import { panRegex, pincodeRegex } from '../../utils/validation';
import { formatDate } from '../../utils/formatters';

type KycRouteProp = RouteProp<RootStackParamList, 'KycVerification'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const KycVerificationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<KycRouteProp>();
  const { returnScreen, returnParams } = route.params || {};

  const { user } = useAuthStore();
  const { kycData, isVerified, submitKyc, isLoading } = useKycStore();

  // Form states - empty by default per user requirements
  const [fullName, setFullName] = useState(kycData?.fullName || user?.fullName || '');
  const [panNumber, setPanNumber] = useState(kycData?.panNumber || '');
  const [dob, setDob] = useState(kycData?.dob || '');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(kycData?.gender || 'male');
  const [addressLine, setAddressLine] = useState(kycData?.addressLine || '');
  const [city, setCity] = useState(kycData?.city || user?.city || '');
  const [state, setState] = useState(kycData?.state || 'Maharashtra');
  const [pincode, setPincode] = useState(kycData?.pincode || '');

  // Document states
  const [panDocUploaded, setPanDocUploaded] = useState(true);
  const [addressDocUploaded, setAddressDocUploaded] = useState(true);

  // Consent
  const [consentAgreed, setConsentAgreed] = useState(false);

  // Post verification state
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [verifiedCkycNumber, setVerifiedCkycNumber] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 3) {
      errs.fullName = 'Full legal name matching PAN is required';
    }

    const cleanPan = panNumber.trim().toUpperCase();
    if (!cleanPan || !panRegex.test(cleanPan)) {
      errs.panNumber = 'Valid 10-character PAN is required (e.g. ABCDE1234F)';
    }

    if (!dob.trim() || dob.trim().length < 8) {
      errs.dob = 'Date of birth is required (YYYY-MM-DD)';
    }

    if (!addressLine.trim()) {
      errs.addressLine = 'Street address line is required';
    }

    if (!city.trim()) {
      errs.city = 'City name is required';
    }

    if (!pincode.trim() || !pincodeRegex.test(pincode.trim())) {
      errs.pincode = 'Valid 6-digit postal pincode is required';
    }

    if (!consentAgreed) {
      errs.consent = 'Please provide IRDAI CKYC consent to proceed';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleVerifySubmit = async () => {
    if (!validate()) {
      Alert.alert('Required Information', 'Please complete all required fields and accept the IRDAI consent.');
      return;
    }

    try {
      const res = await submitKyc({
        fullName: fullName.trim(),
        panNumber: panNumber.trim().toUpperCase(),
        dob: dob.trim(),
        gender,
        addressLine: addressLine.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        documents: [
          {
            type: 'pan_card',
            name: `PAN_${panNumber.trim().toUpperCase()}.pdf`,
            documentNumber: panNumber.trim().toUpperCase(),
            uploadedAt: new Date().toISOString(),
          },
          {
            type: 'aadhaar',
            name: `Address_Proof_${pincode.trim()}.pdf`,
            documentNumber: `PIN-${pincode.trim()}`,
            uploadedAt: new Date().toISOString(),
          },
        ],
      });

      setVerifiedCkycNumber(res.data.ckycNumber || 'CKYC-VERIFIED');
      setVerifiedSuccess(true);
    } catch (err: any) {
      Alert.alert('KYC Notice', err?.message || 'Could not complete verification.');
    }
  };

  const handleContinueAfterVerification = () => {
    if (returnScreen) {
      navigation.navigate(returnScreen as any, returnParams as any);
    } else {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('MainTabs', { screen: 'ProfileTab' } as any);
      }
    }
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs', { screen: 'ProfileTab' } as any);
    }
  };

  // If already verified previously and not in fresh completion screen
  if (isVerified && !verifiedSuccess && kycData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="My KYC Verification" showBack={true} onBackPress={handleBack} />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.verifiedCard}>
            <View style={styles.verifiedIconWrap}>
              <Ionicons name="checkmark-circle" size={56} color={colors.success} />
            </View>
            <Text style={styles.verifiedTitle}>KYC Verified</Text>
            <Text style={styles.verifiedSub}>
              Your Central KYC (CKYC) registry profile is active and verified under IRDAI guidelines.
            </Text>

            <View style={styles.verifiedDetailsBox}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>CKYC Number</Text>
                <Text style={styles.detailValueBold}>{kycData.ckycNumber || 'CKYC-8819-2041-992'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Verified Name</Text>
                <Text style={styles.detailValue}>{kycData.fullName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>PAN Number</Text>
                <Text style={styles.detailValue}>{kycData.panNumber}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Verified On</Text>
                <Text style={styles.detailValue}>{kycData.verifiedAt ? formatDate(kycData.verifiedAt) : 'Today'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status</Text>
                <Badge label="Verified" variant="success" size="sm" />
              </View>
            </View>

            <Button
              title={returnScreen ? "Continue with Application" : "Back to Profile"}
              variant="primary"
              size="lg"
              onPress={handleContinueAfterVerification}
              style={{ width: '100%', marginTop: spacing.md }}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Success Screen immediately after verification
  if (verifiedSuccess) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="KYC Verification" showBack={true} onBackPress={handleContinueAfterVerification} />
        <View style={styles.successScreenContent}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={60} color={colors.white} />
          </View>
          <Text style={styles.successHeading}>KYC Verified Successfully</Text>
          <Text style={styles.successDescription}>
            Your identity documents and CKYC registry status have been verified under IRDAI standards.
          </Text>

          <View style={styles.ckycBox}>
            <Text style={styles.ckycBoxLabel}>Registered CKYC Reference</Text>
            <Text style={styles.ckycBoxNumber}>{verifiedCkycNumber}</Text>
            <Badge label="Active & Verified" variant="success" size="sm" style={{ marginTop: 6 }} />
          </View>

          <Button
            title={returnScreen ? "Continue Proposal" : "Done"}
            variant="primary"
            size="lg"
            onPress={handleContinueAfterVerification}
            style={styles.successDoneBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="KYC Verification" showBack={true} onBackPress={handleBack} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Banner */}
          <View style={styles.infoBanner}>
            <MaterialCommunityIcons name="shield-check" size={24} color={colors.primaryBlue} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoBannerTitle}>IRDAI Mandatory KYC</Text>
              <Text style={styles.infoBannerText}>
                Complete your digital verification once to apply for any verified insurance policy instantly.
              </Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>1. Identity Details</Text>

            <Input
              label="Full Legal Name"
              placeholder="As printed on your PAN card"
              value={fullName}
              onChangeText={(val) => {
                setFullName(val);
                if (errors.fullName) setErrors({ ...errors, fullName: '' });
              }}
              error={errors.fullName}
              leftIcon={<Ionicons name="person-outline" size={18} color={colors.textSecondary} />}
            />

            <Input
              label="PAN Card Number"
              placeholder="e.g. ABCDE1234F"
              value={panNumber}
              onChangeText={(val) => {
                setPanNumber(val.toUpperCase());
                if (errors.panNumber) setErrors({ ...errors, panNumber: '' });
              }}
              maxLength={10}
              autoCapitalize="characters"
              error={errors.panNumber}
              leftIcon={<Ionicons name="card-outline" size={18} color={colors.textSecondary} />}
            />

            <Input
              label="Date of Birth"
              placeholder="YYYY-MM-DD (e.g. 1994-08-20)"
              value={dob}
              onChangeText={(val) => {
                setDob(val);
                if (errors.dob) setErrors({ ...errors, dob: '' });
              }}
              error={errors.dob}
              leftIcon={<Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />}
            />

            {/* Gender Selection */}
            <Text style={styles.fieldLabel}>Gender</Text>
            <View style={styles.genderRow}>
              {(['male', 'female', 'other'] as const).map((g) => {
                const isSelected = gender === g;
                return (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setGender(g)}
                    style={[styles.genderBtn, isSelected && styles.genderBtnActive]}
                  >
                    <Text style={[styles.genderText, isSelected && styles.genderTextActive]}>
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>2. Residential Address</Text>

            <Input
              label="Address Line"
              placeholder="Flat / Building / Street"
              value={addressLine}
              onChangeText={(val) => {
                setAddressLine(val);
                if (errors.addressLine) setErrors({ ...errors, addressLine: '' });
              }}
              error={errors.addressLine}
              leftIcon={<Ionicons name="home-outline" size={18} color={colors.textSecondary} />}
            />

            <View style={styles.rowTwo}>
              <View style={{ flex: 1 }}>
                <Input
                  label="City"
                  placeholder="e.g. Mumbai"
                  value={city}
                  onChangeText={(val) => {
                    setCity(val);
                    if (errors.city) setErrors({ ...errors, city: '' });
                  }}
                  error={errors.city}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="State"
                  placeholder="e.g. Maharashtra"
                  value={state}
                  onChangeText={setState}
                />
              </View>
            </View>

            <Input
              label="Postal Pincode"
              placeholder="6-digit pincode"
              value={pincode}
              onChangeText={(val) => {
                setPincode(val);
                if (errors.pincode) setErrors({ ...errors, pincode: '' });
              }}
              maxLength={6}
              keyboardType="number-pad"
              error={errors.pincode}
              
            />

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>3. Document Verification</Text>

            <View style={styles.docItem}>
              <View style={styles.docLeft}>
                <Ionicons name="document-text-outline" size={22} color={colors.primaryBlue} />
                <View>
                  <Text style={styles.docTitle}>PAN Card Proof</Text>
                  <Text style={styles.docSub}>
                    {panNumber ? `PAN_${panNumber}.pdf` : 'Scanned document'}
                  </Text>
                </View>
              </View>
              <Badge label="Attached" variant="success" size="sm" />
            </View>

            <View style={styles.docItem}>
              <View style={styles.docLeft}>
                <Ionicons name="document-text-outline" size={22} color={colors.primaryBlue} />
                <View>
                  <Text style={styles.docTitle}>Address Proof (Aadhaar / Passport)</Text>
                  <Text style={styles.docSub}>
                    {pincode ? `Proof_PIN_${pincode}.pdf` : 'Address verification document'}
                  </Text>
                </View>
              </View>
              <Badge label="Attached" variant="success" size="sm" />
            </View>

            {/* Consent Box */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setConsentAgreed(!consentAgreed);
                if (errors.consent) setErrors({ ...errors, consent: '' });
              }}
              style={[styles.consentBox, errors.consent ? styles.consentBoxError : null]}
            >
              <Ionicons
                name={consentAgreed ? 'checkbox' : 'square-outline'}
                size={22}
                color={consentAgreed ? colors.primaryBlue : colors.textMuted}
                style={{ marginTop: 2 }}
              />
              <Text style={styles.consentText}>
                I hereby declare that the details provided are true and correct. I authorize InsureEase and the insurance underwriter to verify my identity via Central KYC Registry (CKYCR) under IRDAI guidelines.
              </Text>
            </TouchableOpacity>
            {errors.consent ? <Text style={styles.errorText}>{errors.consent}</Text> : null}

            <Button
              title="Verify KYC Immediately"
              variant="primary"
              size="lg"
              loading={isLoading}
              onPress={handleVerifySubmit}
              style={styles.submitBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.lightBlueBg,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: '#CBE0FF',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  infoBannerTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  infoBannerText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.primaryNavy,
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  genderRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
  },
  genderBtnActive: {
    borderColor: colors.primaryBlue,
    backgroundColor: colors.lightBlueBg,
  },
  genderText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  genderTextActive: {
    color: colors.primaryBlue,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },
  rowTwo: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.sm + 2,
    marginBottom: spacing.xs,
  },
  docLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  docTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  docSub: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
  },
  consentBox: {
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  consentBoxError: {
    borderColor: colors.error,
  },
  consentText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    fontSize: 11,
    marginTop: 4,
  },
  submitBtn: {
    marginTop: spacing.md,
  },
  verifiedCard: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
  },
  verifiedIconWrap: {
    marginBottom: spacing.sm,
  },
  verifiedTitle: {
    ...typography.h2,
    color: colors.primaryNavy,
  },
  verifiedSub: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  verifiedDetailsBox: {
    width: '100%',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.primaryNavy,
  },
  detailValueBold: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryBlue,
  },
  successScreenContent: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  successHeading: {
    ...typography.h2,
    color: colors.primaryNavy,
    textAlign: 'center',
  },
  successDescription: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  ckycBox: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  ckycBoxLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  ckycBoxNumber: {
    ...typography.h3,
    color: colors.primaryBlue,
    marginTop: 4,
  },
  successDoneBtn: {
    width: '100%',
  },
});
