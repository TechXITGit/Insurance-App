import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { insuranceCategories } from '../../data/insuranceCategories';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { policyService } from '../../services/policyService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuthStore } from '../../store/authStore';

type RenewRouteProp = RouteProp<RootStackParamList, 'RenewPolicy'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const RenewPolicyScreen: React.FC = () => {
  const route = useRoute<RenewRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { prefilledPolicyNumber, categoryId } = route.params || {};

  const { isAuthenticated, user, setPendingAction } = useAuthStore();

  const [selectedCategory, setSelectedCategory] = useState(categoryId || 'health');
  const [insurerName, setInsurerName] = useState('');
  const [policyNumber, setPolicyNumber] = useState(prefilledPolicyNumber || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const [step, setStep] = useState<'input' | 'verified' | 'paid'>('input');
  const [loading, setLoading] = useState(false);
  const [verifiedData, setVerifiedData] = useState<any>(null);
  const [renewalResult, setRenewalResult] = useState<any>(null);

  const insurers = [
    'Care Health Insurance',
    'HDFC ERGO General Insurance',
    'Star Health & Allied Insurance',
    'Max Life Insurance',
    'Tata AIG General Insurance',
    'ICICI Lombard General Insurance',
    'LIC of India',
  ];

  const handleVerifyPolicy = async () => {
    if (!policyNumber.trim() || policyNumber.trim().length < 4) {
      Alert.alert('Required', 'Please enter a valid policy number');
      return;
    }

    if (!isAuthenticated) {
      setPendingAction({
        type: 'RENEW',
        targetParams: { prefilledPolicyNumber: policyNumber, categoryId: selectedCategory },
        timestamp: Date.now(),
      });
      navigation.navigate('Login', {
        returnScreen: 'RenewPolicy',
        returnParams: { prefilledPolicyNumber: policyNumber, categoryId: selectedCategory },
      });
      return;
    }

    setLoading(true);
    try {
      const result = await policyService.verifyPolicyForRenewal(policyNumber, insurerName, phone);
      setVerifiedData(result);
      setStep('verified');
    } catch (err: any) {
      Alert.alert('Verification Notice', err?.message || 'Policy could not be verified automatically.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayRenewal = async () => {
    setLoading(true);
    try {
      const result = await policyService.submitRenewal({
        id: `ren_${Date.now()}`,
        policyNumber: verifiedData.policyNumber,
        categoryId: selectedCategory as any,
        insurerName: verifiedData.insurerName,
        previousExpiryDate: verifiedData.expiryDate,
        applicantName: verifiedData.holderName,
        registeredPhone: phone,
        renewalPremium: verifiedData.renewalPremium,
        status: 'renewed',
        submittedAt: new Date().toISOString(),
      });
      setRenewalResult(result);
      setStep('paid');
    } catch (err: any) {
      Alert.alert('Renewal Error', err?.message || 'Renewal transaction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Renew Policy" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Step 1: Input & Verification */}
        {step === 'input' && (
          <View>
            <View style={styles.introCard}>
              <MaterialCommunityIcons name="refresh-circle" size={32} color={colors.primaryBlue} />
              <View style={{ flex: 1 }}>
                <Text style={styles.introTitle}>Instant Policy Renewal</Text>
                <Text style={styles.introSub}>
                  Enter your policy number to verify coverage and preserve your No Claim Bonus (NCB).
                </Text>
              </View>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.formHeading}>1. Select Insurer & Policy</Text>

              {/* Insurer Selector Chips */}
              <Text style={styles.inputLabel}>Current Insurer</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.insurersScroll}>
                {insurers.map((name) => (
                  <TouchableOpacity
                    key={name}
                    onPress={() => setInsurerName(name)}
                    style={[styles.insurerChip, insurerName === name && styles.insurerChipActive]}
                  >
                    <Text
                      style={[styles.insurerChipText, insurerName === name && styles.insurerChipTextActive]}
                    >
                      {name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Input
                label="Existing Policy Number"
                value={policyNumber}
                onChangeText={setPolicyNumber}
                placeholder="e.g. CARE-IND-8829104"
                autoCapitalize="characters"
              />

              <Input
                label="Registered Mobile Number"
                prefix="+91"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={10}
              />

              <Button
                title={isAuthenticated ? 'Verify & Fetch Renewal Quote' : 'Sign In & Verify Policy'}
                onPress={handleVerifyPolicy}
                loading={loading}
                variant="primary"
                size="lg"
                style={{ marginTop: spacing.sm }}
              />
            </View>

            {/* Why Renew Notice */}
            <View style={styles.guidanceCard}>
              <Ionicons name="information-circle" size={20} color={colors.primaryNavy} />
              <View style={{ flex: 1 }}>
                <Text style={styles.guidanceHeading}>Continuity Benefits</Text>
                <Text style={styles.guidanceText}>
                  Renewing before the 30-day grace period ensures you retain your accumulated waiting period credits and earned NCB bonus.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Step 2: Verified Policy Review */}
        {step === 'verified' && verifiedData && (
          <View>
            <View style={styles.verifiedCard}>
              <View style={styles.verifiedHeader}>
                <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.verifiedTitle}>Policy Verified Successfully</Text>
                  <Text style={styles.verifiedSub}>{verifiedData.message}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Text style={styles.label}>Policyholder:</Text>
                <Text style={styles.value}>{verifiedData.holderName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Policy Number:</Text>
                <Text style={styles.value}>{verifiedData.policyNumber}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Insurer:</Text>
                <Text style={styles.value}>{verifiedData.insurerName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Sum Insured:</Text>
                <Text style={styles.value}>{formatCurrency(verifiedData.currentSumInsured, true)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Expiry Date:</Text>
                <Text style={styles.value}>{formatDate(verifiedData.expiryDate)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>NCB Cumulative Bonus:</Text>
                <Text style={[styles.value, { color: colors.success }]}>
                  +{verifiedData.ncbPercentage}% Bonus Applied
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.pricingSummaryRow}>
                <Text style={styles.pricingSummaryLabel}>Renewal Premium (incl. GST):</Text>
                <Text style={styles.pricingSummaryAmount}>
                  {formatCurrency(verifiedData.renewalPremium)}
                </Text>
              </View>

              <Button
                title="Proceed to Complete Renewal"
                onPress={handlePayRenewal}
                loading={loading}
                variant="primary"
                size="lg"
                style={{ marginTop: spacing.md }}
              />

              <Button
                title="Change Policy Number"
                onPress={() => setStep('input')}
                variant="ghost"
                size="sm"
                style={{ marginTop: spacing.xs }}
              />
            </View>
          </View>
        )}

        {/* Step 3: Paid & Confirmed */}
        {step === 'paid' && renewalResult && (
          <View style={styles.confirmedContainer}>
            <Ionicons name="checkmark-done-circle" size={80} color={colors.success} />
            <Text style={styles.confirmedTitle}>Policy Renewed Successfully!</Text>
            <Text style={styles.confirmedSubtitle}>
              Your policy {renewalResult.policyNumber} has been renewed with continuity credits intact.
            </Text>

            <View style={styles.receiptCard}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Transaction ID:</Text>
                <Text style={styles.value}>{renewalResult.transactionId}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Amount Paid:</Text>
                <Text style={styles.value}>{formatCurrency(renewalResult.renewalPremium)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Next Expiry Date:</Text>
                <Text style={styles.value}>
                  {formatDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString())}
                </Text>
              </View>
              <Badge label="Active • Verified" variant="success" size="sm" style={{ marginTop: spacing.sm }} />
            </View>

            <Button
              title="View In My Policies"
              onPress={() =>
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs', params: { screen: 'MyPoliciesTab' } }],
                })
              }
              variant="primary"
              size="lg"
              style={{ width: '100%', marginTop: spacing.md }}
            />
          </View>
        )}
      </ScrollView>
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
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.lightBlueBg,
    borderRadius: radii.card,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  introTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  introSub: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  formHeading: {
    ...typography.h3,
    color: colors.primaryNavy,
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  insurersScroll: {
    marginBottom: spacing.md,
  },
  insurerChip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
    marginRight: spacing.xs + 2,
  },
  insurerChipActive: {
    backgroundColor: colors.primaryNavy,
    borderColor: colors.primaryNavy,
  },
  insurerChipText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  insurerChipTextActive: {
    color: colors.white,
  },
  guidanceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  guidanceHeading: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  guidanceText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  verifiedCard: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  verifiedHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  verifiedTitle: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  verifiedSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  value: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  pricingSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  pricingSummaryLabel: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  pricingSummaryAmount: {
    ...typography.h3,
    color: colors.primaryBlue,
  },
  confirmedContainer: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  confirmedTitle: {
    ...typography.h2,
    color: colors.primaryNavy,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  confirmedSubtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.lg,
    maxWidth: 300,
  },
  receiptCard: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    width: '100%',
  },
});
