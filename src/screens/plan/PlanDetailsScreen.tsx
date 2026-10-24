import React, { useState, useEffect } from 'react';
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
import { demoPlans } from '../../data/demoPlans';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { Header } from '../../components/common/Header';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { formatCurrency, formatWaitingPeriod } from '../../utils/formatters';
import { useAuthStore } from '../../store/authStore';
import { useCompareStore } from '../../store/compareStore';
import { useSavedPlansStore } from '../../store/savedPlansStore';
import { useRecentlyExploredStore } from '../../store/recentlyExploredStore';

type PlanDetailsRouteProp = RouteProp<RootStackParamList, 'PlanDetails'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const PlanDetailsScreen: React.FC = () => {
  const route = useRoute<PlanDetailsRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { planId } = route.params;

  const { isAuthenticated, setPendingAction } = useAuthStore();
  const { addPlan, isInCompare } = useCompareStore();
  const { toggleSavePlan, isSaved } = useSavedPlansStore();
  const { addExploredPlan } = useRecentlyExploredStore();

  const plan = demoPlans.find((p) => p.id === planId) || demoPlans[0];

  useEffect(() => {
    if (plan?.id) {
      addExploredPlan(plan.id);
    }
  }, [plan?.id]);

  const [selectedSumInsured, setSelectedSumInsured] = useState<number>(plan.baseSumInsured);
  const [selectedTenure, setSelectedTenure] = useState<number>(1);
  const [selectedRiders, setSelectedRiders] = useState<string[]>([]);

  // Calculate dynamic premium based on selected sum insured and riders
  const sumRatio = Math.sqrt(selectedSumInsured / plan.baseSumInsured);
  const riderTotal = plan.compatibleRiders
    .filter((r) => selectedRiders.includes(r.id))
    .reduce((sum, r) => sum + r.premiumAmount, 0);

  const calculatedAnnualPremium = Math.round(plan.basePremium * sumRatio * selectedTenure + riderTotal);
  const calculatedGst = Math.round(calculatedAnnualPremium * 0.18);
  const totalPayable = calculatedAnnualPremium + calculatedGst;

  const handleToggleRider = (riderId: string) => {
    if (selectedRiders.includes(riderId)) {
      setSelectedRiders(selectedRiders.filter((id) => id !== riderId));
    } else {
      setSelectedRiders([...selectedRiders, riderId]);
    }
  };

  const handleApply = () => {
    if (!isAuthenticated) {
      setPendingAction({
        type: 'APPLY',
        planId: plan.id,
        categoryId: plan.categoryId,
        draftData: {
          sumInsured: selectedSumInsured,
          selectedTenure,
          selectedRiders,
          annualPremium: calculatedAnnualPremium,
        },
        timestamp: Date.now(),
      });
      navigation.navigate('Login', {
        returnScreen: 'ApplicationForm',
        returnParams: { planId: plan.id },
      });
    } else {
      navigation.navigate('ApplicationForm', { planId: plan.id });
    }
  };

  const handleCompare = () => {
    const res = addPlan(plan.id, plan.categoryId);
    if (!res.success && res.message) {
      Alert.alert('Compare Notice', res.message);
    } else {
      navigation.navigate('PlanComparison', { categoryId: plan.categoryId });
    }
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      setPendingAction({
        type: 'SAVE_PLAN',
        planId: plan.id,
        timestamp: Date.now(),
      });
      navigation.navigate('Login', {});
    } else {
      toggleSavePlan(plan.id);
    }
  };

  const saved = isSaved(plan.id);
  const compared = isInCompare(plan.id);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={plan.name}
        subtitle={plan.providerName}
        rightAction={
          <TouchableOpacity onPress={handleSave} style={styles.headerSaveBtn}>
            <Ionicons
              name={saved ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={saved ? colors.primaryBlue : colors.primaryNavy}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Plan Header Card */}
        <View style={styles.planHeaderCard}>
          <View style={styles.badgeRow}>
            <Badge label={plan.categoryName} variant="info" size="sm" />
            {plan.claimSettlementRatio > 0 && (
              <Badge label={`${plan.claimSettlementRatio}% Claim Ratio`} variant="success" size="sm" />
            )}
          </View>

          <Text style={styles.planTitle}>{plan.name}</Text>
          <Text style={styles.providerSubtitle}>Provided by {plan.providerName}</Text>
          <Text style={styles.overviewText}>{plan.overview}</Text>

          {/* Quick Metrics */}
          <View style={styles.metricsBox}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Room Rent</Text>
              <Text numberOfLines={1} style={styles.metricVal}>
                {plan.roomRentLimit.split('(')[0].trim()}
              </Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Cashless Network</Text>
              <Text style={styles.metricVal}>
                {plan.cashlessHospitalsCount ? `${plan.cashlessHospitalsCount}+` : 'Universal'}
              </Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Co-Payment</Text>
              <Text style={styles.metricVal}>{plan.copayPercentage}%</Text>
            </View>
          </View>
        </View>

        {/* Sum Insured Selector */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Select Coverage (Sum Insured)</Text>
          <Text style={styles.sectionSubtitle}>Choose the annual financial medical protection limit</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
            {plan.sumInsuredOptions.map((amount) => {
              const isSelected = selectedSumInsured === amount;
              return (
                <TouchableOpacity
                  key={amount}
                  onPress={() => setSelectedSumInsured(amount)}
                  style={[styles.optionChip, isSelected && styles.optionChipSelected]}
                >
                  <Text style={[styles.optionChipText, isSelected && styles.optionChipTextSelected]}>
                    {formatCurrency(amount, true)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Policy Tenure Selector */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Policy Tenure</Text>
          <Text style={styles.sectionSubtitle}>Multi-year options protect against annual premium inflation</Text>
          <View style={styles.tenureRow}>
            {plan.policyTermsYears.map((years) => (
              <TouchableOpacity
                key={years}
                onPress={() => setSelectedTenure(years)}
                style={[styles.tenureChip, selectedTenure === years && styles.tenureChipSelected]}
              >
                <Text style={[styles.tenureChipText, selectedTenure === years && styles.tenureChipTextSelected]}>
                  {years} Year{years > 1 ? 's' : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Detailed Benefits */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Coverage & Benefits</Text>
          <Text style={styles.sectionSubtitle}>Included medical protections under this policy</Text>
          <View style={styles.benefitsList}>
            {plan.detailedBenefits.map((b) => (
              <View key={b.id} style={styles.benefitRow}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} style={{ marginTop: 2 }} />
                <View style={styles.benefitInfo}>
                  <Text style={styles.benefitTitle}>{b.title}</Text>
                  <Text style={styles.benefitDesc}>{b.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Waiting Periods & Exclusions */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Waiting Periods & Exclusions</Text>
          <Text style={styles.sectionSubtitle}>Statutory waiting times for treatment eligibility</Text>
          <View style={styles.waitingGrid}>
            <View style={styles.waitingItem}>
              <Text style={styles.waitingLabel}>Initial Illness Waiting</Text>
              <Text style={styles.waitingValue}>
                {formatWaitingPeriod(plan.waitingPeriodGeneralMonths)}
              </Text>
            </View>
            <View style={styles.waitingItem}>
              <Text style={styles.waitingLabel}>Pre-existing Conditions</Text>
              <Text style={styles.waitingValue}>
                {formatWaitingPeriod(plan.waitingPeriodPreExistingMonths)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {plan.exclusions.map((ex) => (
            <View key={ex.id} style={styles.exclusionRow}>
              <Ionicons name="close-circle" size={17} color={colors.error} style={{ marginTop: 2 }} />
              <View style={styles.exclusionInfo}>
                <Text style={styles.exclusionTitle}>{ex.title}</Text>
                <Text style={styles.exclusionDesc}>{ex.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Compatible Add-ons / Riders */}
        {plan.compatibleRiders.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Available Add-ons & Riders</Text>
            <Text style={styles.sectionSubtitle}>Select optional covers to enhance your protection</Text>

            {plan.compatibleRiders.map((rider) => {
              const isChecked = selectedRiders.includes(rider.id);
              return (
                <TouchableOpacity
                  key={rider.id}
                  activeOpacity={0.8}
                  onPress={() => handleToggleRider(rider.id)}
                  style={[styles.riderCard, isChecked && styles.riderCardActive]}
                >
                  <Ionicons
                    name={isChecked ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={isChecked ? colors.primaryBlue : colors.textMuted}
                  />
                  <View style={styles.riderInfo}>
                    <Text style={styles.riderName}>{rider.name}</Text>
                    <Text style={styles.riderDesc}>{rider.description}</Text>
                  </View>
                  <Text style={styles.riderPrice}>+{formatCurrency(rider.premiumAmount)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Claim Settlement Procedure */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>How to Claim Cashless</Text>
          <Text style={styles.bodyText}>{plan.claimProcessSummary}</Text>
          <View style={styles.docsContainer}>
            <Text style={styles.docsTitle}>Required Documents:</Text>
            {plan.requiredDocuments.map((doc, i) => (
              <Text key={i} style={styles.docItem}>
                • {doc}
              </Text>
            ))}
          </View>
        </View>

        {/* Data Recency & Sourced Information */}
        <View style={styles.recencyCard}>
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.recencyText}>
            Catalog data last reviewed: {plan.lastUpdated}. Sourced from approved public disclosure documents.
          </Text>
        </View>
      </ScrollView>

      {/* Persistent Bottom Floating Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceInfo}>
          <Text style={styles.bottomPriceLabel}>
            Cover: {formatCurrency(selectedSumInsured, true)}
          </Text>
          <View style={styles.bottomPriceRow}>
            <Text style={styles.bottomPriceAmount}>{formatCurrency(totalPayable)}</Text>
            <Text style={styles.bottomPriceTenure}>/ {selectedTenure} yr</Text>
          </View>
          <Text style={styles.bottomGstText}>incl. 18% GST (Indicative)</Text>
        </View>

        <View style={styles.bottomActions}>
          <TouchableOpacity
            onPress={handleCompare}
            style={[styles.bottomCompareBtn, compared && styles.bottomCompareBtnActive]}
          >
            <MaterialCommunityIcons
              name={compared ? 'check' : 'scale-balance'}
              size={18}
              color={compared ? colors.white : colors.primaryBlue}
            />
            <Text style={[styles.bottomCompareText, compared && styles.bottomCompareTextActive]}>
              {compared ? 'In Compare' : 'Compare'}
            </Text>
          </TouchableOpacity>

          <Button
            title="Apply Now"
            onPress={handleApply}
            variant="primary"
            size="md"
            style={styles.bottomApplyBtn}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
  },
  headerSaveBtn: {
    padding: spacing.xs,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  planHeaderCard: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.xs,
  },
  planTitle: {
    ...typography.h2,
    color: colors.primaryNavy,
    marginTop: 4,
  },
  providerSubtitle: {
    ...typography.bodyMedium,
    color: colors.primaryBlue,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  overviewText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  metricsBox: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.sm,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  metricVal: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
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
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  optionsScroll: {
    marginTop: 4,
  },
  optionChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
    marginRight: spacing.sm,
  },
  optionChipSelected: {
    backgroundColor: colors.primaryBlue,
    borderColor: colors.primaryBlue,
  },
  optionChipText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  optionChipTextSelected: {
    color: colors.white,
  },
  tenureRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tenureChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
  },
  tenureChipSelected: {
    backgroundColor: colors.primaryNavy,
    borderColor: colors.primaryNavy,
  },
  tenureChipText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  tenureChipTextSelected: {
    color: colors.white,
  },
  benefitsList: {
    gap: spacing.sm,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  benefitInfo: {
    flex: 1,
  },
  benefitTitle: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  benefitDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 1,
  },
  waitingGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  waitingItem: {
    flex: 1,
    alignItems: 'center',
  },
  waitingLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  waitingValue: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primaryNavy,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  exclusionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  exclusionInfo: {
    flex: 1,
  },
  exclusionTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.error,
  },
  exclusionDesc: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  riderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.xs + 2,
    gap: spacing.sm,
  },
  riderCardActive: {
    borderColor: colors.primaryBlue,
    backgroundColor: colors.lightBlueBg,
  },
  riderInfo: {
    flex: 1,
  },
  riderName: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  riderDesc: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  riderPrice: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.primaryBlue,
  },
  bodyText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  docsContainer: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  docsTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryNavy,
    marginBottom: 4,
  },
  docItem: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  recencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.card,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  recencyText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  bottomBar: {
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomPriceInfo: {
    flex: 1,
  },
  bottomPriceLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  bottomPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bottomPriceAmount: {
    ...typography.h3,
    color: colors.primaryNavy,
  },
  bottomPriceTenure: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: 3,
  },
  bottomGstText: {
    ...typography.caption,
    fontSize: 9,
    color: colors.textMuted,
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bottomCompareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.primaryBlue,
    backgroundColor: colors.white,
    gap: 4,
  },
  bottomCompareBtnActive: {
    backgroundColor: colors.primaryBlue,
  },
  bottomCompareText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryBlue,
  },
  bottomCompareTextActive: {
    color: colors.white,
  },
  bottomApplyBtn: {
    minWidth: 120,
  },
});
