import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { InsurancePlan } from '../../types/insurance';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { formatCurrency } from '../../utils/formatters';
import { DemoBadge } from './DemoBadge';
import { Badge } from '../common/Badge';

export interface PlanCardProps {
  plan: InsurancePlan;
  onPressDetails: () => void;
  onPressApply: () => void;
  onPressCompare: () => void;
  onPressSave?: () => void;
  isSaved?: boolean;
  isInCompare?: boolean;
  recommendationReason?: string;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  onPressDetails,
  onPressApply,
  onPressCompare,
  onPressSave,
  isSaved = false,
  isInCompare = false,
  recommendationReason,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPressDetails}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`${plan.name} by ${plan.providerName}`}
    >
      {/* Personalized Match Badge */}
      {recommendationReason ? (
        <View style={styles.recommendationBanner}>
          <MaterialCommunityIcons name="star-face" size={14} color="#0369A1" />
          <Text numberOfLines={1} style={styles.recommendationReasonText}>
            {recommendationReason}
          </Text>
        </View>
      ) : null}

      {/* Top Bar: Provider, Category, and Bookmark */}
      <View style={styles.topRow}>
        <View style={styles.providerInfo}>
          <View style={styles.providerBadge}>
            <MaterialCommunityIcons name="shield-check" size={16} color={colors.primaryBlue} />
            <Text numberOfLines={1} style={styles.providerName}>
              {plan.providerName}
            </Text>
          </View>
        </View>

        {onPressSave ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={isSaved ? 'Remove saved plan' : 'Save plan'}
            onPress={(e) => {
              e.stopPropagation?.();
              onPressSave();
            }}
            style={styles.saveBtn}
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isSaved ? colors.primaryBlue : colors.textMuted}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Plan Title & Short Description */}
      <View style={styles.titleContainer}>
        <Text style={styles.planName}>{plan.name}</Text>
        <Text numberOfLines={2} style={styles.shortDescription}>
          {plan.shortDescription}
        </Text>
      </View>

      {/* Highlights / CSR / Hospitals */}
      <View style={styles.metricsRow}>
        {plan.claimSettlementRatio > 0 && (
          <Badge
            label={`${plan.claimSettlementRatio}% Settlement`}
            variant="success"
            size="sm"
            style={styles.metricBadge}
          />
        )}
        {plan.cashlessHospitalsCount ? (
          <Badge
            label={`${plan.cashlessHospitalsCount.toLocaleString()}+ Hospitals`}
            variant="info"
            size="sm"
            style={styles.metricBadge}
          />
        ) : null}
      </View>

      {/* Key Benefits List */}
      <View style={styles.benefitsContainer}>
        {plan.keyBenefits.slice(0, 3).map((benefit, idx) => (
          <View key={idx} style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} style={styles.checkIcon} />
            <Text numberOfLines={1} style={styles.benefitText}>
              {benefit}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      {/* Pricing & Coverage Strip */}
      <View style={styles.pricingStrip}>
        <View style={styles.coverBadge}>
          <MaterialCommunityIcons name="shield-outline" size={14} color={colors.primaryNavy} />
          <Text style={styles.coverText}>
            Cover: <Text style={styles.coverHighlight}>{formatCurrency(plan.baseSumInsured, true)}</Text>
          </Text>
        </View>

        <View style={styles.premiumBox}>
          <View style={styles.priceRow}>
            <Text style={styles.priceAmount}>{formatCurrency(plan.basePremium)}</Text>
            <Text style={styles.priceFrequency}>/ year</Text>
          </View>
          <Text style={styles.taxNote}>+ 18% GST applicable</Text>
        </View>
      </View>

      {/* Action Buttons Bar */}
      <View style={styles.actionsBar}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={(e) => {
            e.stopPropagation?.();
            onPressCompare();
          }}
          style={[styles.compareBtn, isInCompare && styles.compareBtnActive]}
          accessibilityRole="button"
          accessibilityLabel={isInCompare ? 'Remove from compare' : 'Add to compare'}
        >
          <MaterialCommunityIcons
            name={isInCompare ? 'check' : 'scale-balance'}
            size={16}
            color={isInCompare ? colors.white : colors.primaryBlue}
          />
          <Text style={[styles.compareBtnText, isInCompare && styles.compareBtnTextActive]}>
            {isInCompare ? 'Added' : 'Compare'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={(e) => {
            e.stopPropagation?.();
            onPressApply();
          }}
          style={styles.applyBtn}
          accessibilityRole="button"
          accessibilityLabel={`Apply now for ${plan.name}`}
        >
          <Text style={styles.applyBtnText}>Apply Now</Text>
          <Ionicons name="arrow-forward" size={15} color={colors.white} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  recommendationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: radii.sm,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: spacing.sm,
  },
  recommendationReasonText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  providerInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  providerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  providerName: {
    ...typography.caption,
    color: colors.primaryNavy,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  saveBtn: {
    padding: 4,
  },
  planName: {
    ...typography.h3,
    color: colors.primaryNavy,
    marginTop: 2,
    marginBottom: 4,
  },
  shortDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.sm,
  },
  metricBadge: {
    marginRight: 4,
    marginBottom: 4,
  },
  benefitsContainer: {
    marginBottom: spacing.sm,
    gap: 5,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    marginRight: 6,
  },
  benefitText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    flex: 1,
  },
  titleContainer: {
    marginBottom: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  pricingStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  coverBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FF',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.sm,
    gap: 5,
    borderWidth: 1,
    borderColor: '#D0E5FF',
  },
  coverText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.primaryNavy,
    fontSize: 12,
  },
  coverHighlight: {
    fontWeight: '800',
    color: colors.primaryBlue,
    fontSize: 12,
  },
  premiumBox: {
    alignItems: 'flex-end',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    ...typography.h3,
    fontSize: 17,
    fontWeight: '800',
    color: colors.primaryNavy,
  },
  priceFrequency: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    marginLeft: 3,
  },
  taxNote: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  compareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.primaryBlue,
    backgroundColor: colors.white,
    gap: 5,
  },
  compareBtnActive: {
    backgroundColor: colors.primaryBlue,
  },
  compareBtnText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryBlue,
    fontSize: 12,
  },
  compareBtnTextActive: {
    color: colors.white,
  },
  applyBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    backgroundColor: colors.primaryBlue,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    gap: 6,
    shadowColor: colors.primaryBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  applyBtnText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.white,
    fontSize: 13,
  },
});
