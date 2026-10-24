import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { radii, shadows, spacing } from '../../theme/spacing';

export interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  selected?: boolean;
  variant?: 'elevated' | 'outlined' | 'flat';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  selected = false,
  variant = 'outlined',
}) => {
  const containerStyles: ViewStyle[] = [
    styles.base,
    variant === 'elevated' ? styles.elevated : undefined,
    variant === 'outlined' ? styles.outlined : undefined,
    variant === 'flat' ? styles.flat : undefined,
    selected ? styles.selected : undefined,
    style,
  ].filter((s): s is ViewStyle => Boolean(s));

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={containerStyles}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radii.card,
    padding: spacing.md,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  elevated: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  flat: {
    backgroundColor: colors.surfaceSubtle,
  },
  selected: {
    borderColor: colors.primaryBlue,
    borderWidth: 2,
    backgroundColor: colors.highlight,
  },
});
