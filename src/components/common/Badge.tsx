import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';

export interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'demo';
  size?: 'sm' | 'md';
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
  style,
  textStyle,
  icon,
}) => {
  const getContainerStyles = (): ViewStyle[] => {
    const list: ViewStyle[] = [styles.base];

    if (size === 'sm') list.push(styles.sizeSm);
    else list.push(styles.sizeMd);

    if (variant === 'success') list.push(styles.success);
    else if (variant === 'warning') list.push(styles.warning);
    else if (variant === 'error') list.push(styles.error);
    else if (variant === 'info') list.push(styles.info);
    else if (variant === 'demo') list.push(styles.demo);
    else list.push(styles.neutral);

    if (style) list.push(style);

    return list;
  };

  const getTextStyles = (): TextStyle[] => {
    const list: TextStyle[] = [typography.badge];

    if (size === 'sm') list.push(styles.textSm);

    if (variant === 'success') list.push(styles.textSuccess);
    else if (variant === 'warning') list.push(styles.textWarning);
    else if (variant === 'error') list.push(styles.textError);
    else if (variant === 'info') list.push(styles.textInfo);
    else if (variant === 'demo') list.push(styles.textDemo);
    else list.push(styles.textNeutral);

    if (textStyle) list.push(textStyle);

    return list;
  };

  return (
    <View style={getContainerStyles()}>
      {icon ? <View style={styles.iconWrapper}>{icon}</View> : null}
      <Text style={getTextStyles()}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radii.full,
  },
  sizeSm: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  sizeMd: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  iconWrapper: {
    marginRight: 4,
  },
  success: {
    backgroundColor: colors.successLight,
  },
  warning: {
    backgroundColor: colors.warningLight,
  },
  error: {
    backgroundColor: colors.errorLight,
  },
  info: {
    backgroundColor: colors.infoLight,
  },
  demo: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  neutral: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textSm: {
    fontSize: 10,
    lineHeight: 12,
  },
  textSuccess: {
    color: colors.success,
  },
  textWarning: {
    color: colors.warning,
  },
  textError: {
    color: colors.error,
  },
  textInfo: {
    color: colors.primaryBlue,
  },
  textDemo: {
    color: '#C2410C',
    fontWeight: '700',
  },
  textNeutral: {
    color: colors.textSecondary,
  },
});
