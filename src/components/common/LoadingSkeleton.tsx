import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';

export interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = radii.sm,
  style,
}) => {
  return (
    <View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
        },
        style,
      ]}
    />
  );
};

export const PlanCardSkeleton: React.FC = () => {
  return (
    <View style={styles.cardSkeleton}>
      <View style={styles.row}>
        <Skeleton width={120} height={20} />
        <Skeleton width={60} height={20} borderRadius={radii.full} />
      </View>
      <Skeleton width="80%" height={24} style={{ marginVertical: spacing.sm }} />
      <Skeleton width="100%" height={14} style={{ marginBottom: spacing.xs }} />
      <Skeleton width="90%" height={14} style={{ marginBottom: spacing.md }} />
      <View style={styles.divider} />
      <View style={styles.row}>
        <Skeleton width={100} height={30} />
        <Skeleton width={110} height={36} borderRadius={radii.md} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.skeleton,
  },
  cardSkeleton: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
});
