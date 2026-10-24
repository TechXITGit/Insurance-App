import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';

export interface DemoBadgeProps {
  label?: string;
  style?: ViewStyle;
}

export const DemoBadge: React.FC<DemoBadgeProps> = () => {
  return null;
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: radii.sm,
    paddingVertical: 3,
    paddingHorizontal: spacing.xs + 2,
    alignSelf: 'flex-start',
    gap: 4,
  },
  text: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
    color: '#C2410C',
  },
});
