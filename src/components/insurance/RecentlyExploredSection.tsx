import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { Badge } from '../common/Badge';
import { useRecentlyExploredStore } from '../../store/recentlyExploredStore';
import { formatCurrency } from '../../utils/formatters';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface RecentlyExploredSectionProps {
  containerStyle?: object;
}

export const RecentlyExploredSection: React.FC<RecentlyExploredSectionProps> = ({
  containerStyle,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { getExploredPlans } = useRecentlyExploredStore();
  const exploredPlans = getExploredPlans();

  if (exploredPlans.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons name="history" size={20} color={colors.primaryBlue} />
          <Text style={styles.title}>Recently Explored Insurance</Text>
        </View>
        <Text style={styles.countBadge}>{exploredPlans.length} plans</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {exploredPlans.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('PlanDetails', { planId: plan.id })}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <Badge label={plan.categoryName} variant="info" size="sm" />
              <View style={styles.csrBadge}>
                <Ionicons name="shield-checkmark" size={12} color={colors.success} />
                <Text style={styles.csrText}>{plan.claimSettlementRatio}% CSR</Text>
              </View>
            </View>

            <Text style={styles.providerName}>{plan.providerName}</Text>
            <Text style={styles.planName} numberOfLines={1}>
              {plan.name}
            </Text>

            <View style={styles.divider} />

            <View style={styles.metricsRow}>
              <View>
                <Text style={styles.metricLabel}>Cover</Text>
                <Text style={styles.metricValue}>
                  {formatCurrency(plan.baseSumInsured, true)}
                </Text>
              </View>

              <View style={styles.metricRight}>
                <Text style={styles.metricLabel}>Premium</Text>
                <Text style={styles.metricPrice}>
                  {formatCurrency(plan.basePremium)}
                  <Text style={styles.perYear}>/yr</Text>
                </Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <Text style={styles.actionText}>View Details</Text>
              <Ionicons name="arrow-forward-circle" size={16} color={colors.primaryBlue} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  countBadge: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  scrollList: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    paddingVertical: 4,
  },
  card: {
    width: 220,
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.sm + 2,
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  csrBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  csrText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
    color: colors.success,
  },
  providerName: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 11,
    marginTop: 2,
  },
  planName: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.primaryNavy,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.xs,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  metricLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
  },
  metricValue: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  metricRight: {
    alignItems: 'flex-end',
  },
  metricPrice: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryBlue,
  },
  perYear: {
    fontSize: 10,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  actionText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryBlue,
    fontSize: 11,
  },
});
