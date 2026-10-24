import React from 'react';
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
import { demoUserPolicies } from '../../data/demoPolicies';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { Header } from '../../components/common/Header';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';

type PolicyDetailsRouteProp = RouteProp<RootStackParamList, 'PolicyDetails'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const PolicyDetailsScreen: React.FC = () => {
  const route = useRoute<PolicyDetailsRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { policyId } = route.params;

  const policy = demoUserPolicies.find((p) => p.policyId === policyId) || demoUserPolicies[0];

  const isRenewalDue = policy.status === 'renewal_due';

  const handleDownloadCertificate = () => {
    Alert.alert(
      'Policy Document',
      `Official IRDAI Policy Schedule PDF for ${policy.policyNumber} has been verified and downloaded to your device documents.`
    );
  };

  const handleClaimAssistance = () => {
    Alert.alert(
      'Cashless Claim Desk',
      `TPA Helpline: 1800-209-1234\nPresent your Digital Health Card at any network hospital TPA counter for instant cashless pre-authorization.`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Policy Details" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Digital Cashless E-Card */}
        <View style={styles.cardContainer}>
          <View style={styles.digitalCard}>
            <View style={styles.cardTopRow}>
              <View>
                <Text style={styles.cardInsurerName}>{policy.providerName}</Text>
                <Text style={styles.cardPlanName}>{policy.planName}</Text>
              </View>
              <MaterialCommunityIcons name="shield-check" size={28} color={colors.white} />
            </View>

            <View style={styles.cardNumberContainer}>
              <Text style={styles.cardNumberLabel}>POLICY NUMBER</Text>
              <Text style={styles.cardNumberText}>{policy.policyNumber}</Text>
            </View>

            <View style={styles.cardBottomRow}>
              <View>
                <Text style={styles.cardSmallLabel}>SUM INSURED</Text>
                <Text style={styles.cardValText}>{formatCurrency(policy.sumInsured, true)}</Text>
              </View>
              <View>
                <Text style={styles.cardSmallLabel}>VALID TILL</Text>
                <Text style={styles.cardValText}>{formatDate(policy.policyExpiryDate)}</Text>
              </View>
              <View>
                <Text style={styles.cardSmallLabel}>STATUS</Text>
                <Text style={styles.cardValText}>{policy.status.toUpperCase()}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Renewal Due Alert */}
        {isRenewalDue && (
          <View style={styles.renewalAlert}>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>Renewal Window Active</Text>
              <Text style={styles.alertDesc}>
                This policy expires on {formatDate(policy.policyExpiryDate)}. Renew now to preserve NCB bonus and waiting-period continuity.
              </Text>
            </View>
            <Button
              title="Renew"
              onPress={() =>
                navigation.navigate('RenewPolicy', {
                  prefilledPolicyNumber: policy.policyNumber,
                  categoryId: policy.categoryId,
                })
              }
              variant="secondary"
              size="sm"
            />
          </View>
        )}

        {/* Policy Information Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Policy Summary</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Policy Type:</Text>
            <Text style={styles.value}>{policy.categoryName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Start Date:</Text>
            <Text style={styles.value}>{formatDate(policy.policyStartDate)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Expiry Date:</Text>
            <Text style={styles.value}>{formatDate(policy.policyExpiryDate)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Annual Premium:</Text>
            <Text style={styles.value}>{formatCurrency(policy.annualPremium)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Members Covered:</Text>
            <Text style={styles.value}>{policy.insuredMembersCount} Member(s)</Text>
          </View>
        </View>

        {/* Portability Option */}
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('PortExistingPolicy', {})
          }
          style={styles.portabilityCard}
        >
          <MaterialCommunityIcons name="swap-horizontal" size={24} color={colors.primaryBlue} />
          <View style={{ flex: 1 }}>
            <Text style={styles.portTitle}>Want to Switch Insurer?</Text>
            <Text style={styles.portDesc}>
              Port this policy under IRDAI rules to transfer your waiting period credits.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            title="Download Policy Certificate"
            onPress={handleDownloadCertificate}
            variant="outline"
            size="md"
            leftIcon={<Ionicons name="download-outline" size={18} color={colors.primaryBlue} />}
          />

          <Button
            title="Instant Cashless Claim Assistance"
            onPress={handleClaimAssistance}
            variant="primary"
            size="md"
            leftIcon={<MaterialCommunityIcons name="hospital-box-outline" size={18} color={colors.white} />}
          />
        </View>
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
  cardContainer: {
    marginBottom: spacing.md,
  },
  digitalCard: {
    backgroundColor: colors.primaryNavy,
    borderRadius: radii.cardLg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#1E3A8A',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  cardInsurerName: {
    ...typography.caption,
    color: '#93C5FD',
    fontWeight: '700',
  },
  cardPlanName: {
    ...typography.h3,
    color: colors.white,
    marginTop: 2,
  },
  cardNumberContainer: {
    marginVertical: spacing.md,
  },
  cardNumberLabel: {
    ...typography.caption,
    fontSize: 9,
    color: '#94A3B8',
    letterSpacing: 1,
  },
  cardNumberText: {
    ...typography.h3,
    color: colors.white,
    letterSpacing: 2,
    marginTop: 2,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  cardSmallLabel: {
    ...typography.caption,
    fontSize: 9,
    color: '#94A3B8',
  },
  cardValText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
    marginTop: 1,
  },
  renewalAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#FEF3C7',
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  alertTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: '#92400E',
  },
  alertDesc: {
    ...typography.caption,
    color: '#78350F',
    marginTop: 2,
    lineHeight: 16,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.primaryNavy,
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
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
  portabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  portTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  portDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionsContainer: {
    gap: spacing.sm,
  },
});
