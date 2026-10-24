import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';

export interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
  title,
  subtitle,
}) => {
  const progressPercent = Math.min(Math.max((currentStep / totalSteps) * 100, 0), 100);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>
            Step {currentStep} of {totalSteps}
          </Text>
        </View>
        <Text style={styles.stepPercent}>{Math.round(progressPercent)}% completed</Text>
      </View>

      <Text style={styles.stepTitle}>{title}</Text>
      {subtitle ? <Text style={styles.stepSubtitle}>{subtitle}</Text> : null}

      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepBadge: {
    backgroundColor: colors.lightBlueBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  stepBadgeText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryBlue,
  },
  stepPercent: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  stepTitle: {
    ...typography.h3,
    color: colors.primaryNavy,
    marginTop: 2,
  },
  stepSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: colors.borderLight,
    borderRadius: radii.full,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primaryBlue,
    borderRadius: radii.full,
  },
});
