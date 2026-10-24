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
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useApplicationDraftStore } from '../../store/applicationDraftStore';
import { useKycStore } from '../../store/kycStore';
import { applicationService } from '../../services/applicationService';
import { formatCurrency } from '../../utils/formatters';

type ReviewRouteProp = RouteProp<RootStackParamList, 'ApplicationReview'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ApplicationReviewScreen: React.FC = () => {
  const route = useRoute<ReviewRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { currentDraft, setStep } = useApplicationDraftStore();
  const { isVerified, kycData } = useKycStore();

  const [submitting, setSubmitting] = useState(false);

  if (!currentDraft) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Application Review" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No draft found to review.</Text>
          <Button
            title="Go to Home"
            onPress={() => navigation.navigate('MainTabs')}
            variant="primary"
            size="md"
          />
        </View>
      </SafeAreaView>
    );
  }

  const netPremium = currentDraft.annualPremium;
  const gstAmount = Math.round(netPremium * 0.18);
  const totalPayable = netPremium + gstAmount;

  const handleSubmit = async () => {
    if (!isVerified) {
      Alert.alert(
        'KYC Verification Required',
        'Central KYC (CKYC) identity verification is required before proposal submission. Please complete instant verification now.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Verify KYC Now',
            onPress: () =>
              navigation.navigate('KycVerification', {
                returnScreen: 'ApplicationReview',
                returnParams: { draftId: currentDraft.id },
              }),
          },
        ]
      );
      return;
    }

    setSubmitting(true);
    try {
      const submission = await applicationService.submitApplication(currentDraft);
      navigation.reset({
        index: 1,
        routes: [
          { name: 'MainTabs' },
          {
            name: 'ApplicationConfirmation',
            params: {
              applicationId: submission.applicationId,
              applicationNumber: submission.applicationNumber,
            },
          },
        ],
      });
    } catch (err: any) {
      Alert.alert('Submission Error', err?.message || 'Could not submit proposal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Review & Submit"
        showBack={true}
        onBackPress={() => {
          if (navigation.canGoBack()) navigation.goBack();
          else navigation.navigate('MainTabs');
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <Ionicons name="shield-checkmark" size={24} color={colors.primaryBlue} />
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Review Your Proposal</Text>
            <Text style={styles.bannerSub}>
              Please verify all entered details before sending to the insurer underwriting desk.
            </Text>
          </View>
        </View>

        {/* Section 1: Plan & Coverage */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>1. Selected Plan & Coverage</Text>
            <TouchableOpacity
              onPress={() => {
                setStep(1);
                navigation.navigate('ApplicationForm', { planId: currentDraft.planId });
              }}
            >
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Plan Name:</Text>
            <Text style={styles.value}>{currentDraft.planName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Sum Insured:</Text>
            <Text style={styles.value}>{formatCurrency(currentDraft.sumInsured, true)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Policy Term:</Text>
            <Text style={styles.value}>{currentDraft.selectedTenureYears} Year(s)</Text>
          </View>
        </View>

        {/* Section 2: Proposer / Applicant */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>2. Proposer Details</Text>
            <TouchableOpacity
              onPress={() => {
                setStep(2);
                navigation.navigate('ApplicationForm', { planId: currentDraft.planId });
              }}
            >
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{currentDraft.applicant.fullName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>+91 {currentDraft.applicant.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{currentDraft.applicant.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>City & PIN:</Text>
            <Text style={styles.value}>
              {currentDraft.applicant.city} ({currentDraft.applicant.pincode})
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>PAN Card:</Text>
            <Text style={styles.value}>{currentDraft.applicant.panNumber || 'Not provided'}</Text>
          </View>
        </View>

        {/* Section 3: Insured Members & Medical */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>3. Insured Members & Medical</Text>
            <TouchableOpacity
              onPress={() => {
                setStep(3);
                navigation.navigate('ApplicationForm', { planId: currentDraft.planId });
              }}
            >
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
          {currentDraft.insuredMembers.map((member, i) => (
            <View key={i} style={styles.memberReviewItem}>
              <Text style={styles.memberName}>{member.fullName || 'Proposer (Self)'}</Text>
              <Text style={styles.memberDetails}>Relation: {member.relation.toUpperCase()}</Text>
              <Text
                style={[
                  styles.pedStatus,
                  member.hasPreExistingConditions ? styles.pedAlert : styles.pedClear,
                ]}
              >
                {member.hasPreExistingConditions
                  ? `Pre-existing Condition: ${member.details || 'Disclosed'}`
                  : 'No Pre-existing Conditions Reported'}
              </Text>
            </View>
          ))}
        </View>

        {/* Section 4: Identity & KYC Verification */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>4. Identity & KYC Verification</Text>
            <Badge
              label={isVerified ? 'VERIFIED' : 'ACTION REQUIRED'}
              variant={isVerified ? 'success' : 'warning'}
              size="sm"
            />
          </View>
          {isVerified ? (
            <View style={styles.kycVerifiedBox}>
              <Ionicons name="shield-checkmark" size={24} color={colors.success} />
              <View style={{ flex: 1 }}>
                <Text style={styles.kycVerifiedTitle}>Central KYC (CKYC) Verified</Text>
                <Text style={styles.kycVerifiedSub}>
                  CKYC Registry: {kycData?.ckycNumber || 'CKYC-VERIFIED'} • IRDAI Compliant
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.kycPendingBox}>
              <View style={styles.kycPendingRow}>
                <Ionicons name="alert-circle" size={22} color={colors.warning} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.kycPendingTitle}>KYC Verification Required</Text>
                  <Text style={styles.kycPendingDesc}>
                    Complete instant digital KYC verification in 1 minute before submitting your proposal.
                  </Text>
                </View>
              </View>
              <Button
                title="Complete Instant KYC Now"
                variant="primary"
                size="sm"
                onPress={() =>
                  navigation.navigate('KycVerification', {
                    returnScreen: 'ApplicationReview',
                    returnParams: { draftId: currentDraft.id },
                  })
                }
                style={{ marginTop: spacing.sm }}
              />
            </View>
          )}
        </View>

        {/* Premium Breakdown */}
        <View style={styles.pricingCard}>
          <Text style={styles.pricingTitle}>Premium Breakdown</Text>
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>Net Base Premium</Text>
            <Text style={styles.pricingValue}>{formatCurrency(netPremium)}</Text>
          </View>
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>Goods & Services Tax (18% GST)</Text>
            <Text style={styles.pricingValue}>{formatCurrency(gstAmount)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.pricingRow}>
            <Text style={styles.totalLabel}>Total Payable Amount</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalPayable)}</Text>
          </View>
          <Text style={styles.indicativeNote}>
            * This is an indicative quotation. Policy issuance and final premium verification are completed by the insurer.
          </Text>
        </View>

        {/* Action Button */}
        <Button
          title="Submit Application Proposal"
          onPress={handleSubmit}
          loading={submitting}
          variant="primary"
          size="lg"
          style={styles.submitBtn}
        />
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
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.lightBlueBg,
    borderRadius: radii.card,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  bannerTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  bannerSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  reviewCard: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: spacing.xs,
  },
  cardTitle: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  editText: {
    ...typography.buttonSmall,
    color: colors.primaryBlue,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
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
  memberReviewItem: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.sm,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  memberName: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  memberDetails: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  pedStatus: {
    ...typography.caption,
    marginTop: 4,
  },
  pedAlert: {
    color: colors.error,
    fontWeight: '600',
  },
  pedClear: {
    color: colors.success,
  },
  pricingCard: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  pricingTitle: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.primaryNavy,
    marginBottom: spacing.sm,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  pricingLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  pricingValue: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  totalLabel: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  totalValue: {
    ...typography.h3,
    color: colors.primaryBlue,
  },
  indicativeNote: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
    lineHeight: 14,
    marginTop: spacing.sm,
  },
  submitBtn: {
    marginBottom: spacing.lg,
  },
  kycVerifiedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: radii.md,
    padding: spacing.md,
  },
  kycVerifiedTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: '#15803D',
  },
  kycVerifiedSub: {
    ...typography.caption,
    color: '#166534',
    marginTop: 2,
  },
  kycPendingBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: radii.md,
    padding: spacing.md,
  },
  kycPendingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  kycPendingTitle: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: '#92400E',
  },
  kycPendingDesc: {
    ...typography.caption,
    color: '#B45309',
    marginTop: 2,
    lineHeight: 16,
  },
});
