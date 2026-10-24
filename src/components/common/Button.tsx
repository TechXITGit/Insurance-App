import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  ...rest
}) => {
  const getContainerStyle = (): ViewStyle[] => {
    const list: ViewStyle[] = [styles.base];

    // Size
    if (size === 'sm') list.push(styles.sizeSm);
    else if (size === 'lg') list.push(styles.sizeLg);
    else list.push(styles.sizeMd);

    // Variant
    if (variant === 'primary') list.push(styles.primary);
    else if (variant === 'secondary') list.push(styles.secondary);
    else if (variant === 'outline') list.push(styles.outline);
    else if (variant === 'ghost') list.push(styles.ghost);
    else if (variant === 'danger') list.push(styles.danger);

    // Disabled / Loading
    if (disabled || loading) {
      list.push(styles.disabled);
    }

    if (style) list.push(style);

    return list;
  };

  const getTextStyle = (): TextStyle[] => {
    const list: TextStyle[] = [styles.textBase];

    if (size === 'sm') list.push(typography.buttonSmall);
    else if (size === 'lg') list.push(typography.buttonLarge);
    else list.push(typography.buttonMedium);

    if (variant === 'primary' || variant === 'secondary' || variant === 'danger') {
      list.push(styles.textWhite);
    } else if (variant === 'outline') {
      list.push(styles.textPrimary);
    } else if (variant === 'ghost') {
      list.push(styles.textGhost);
    }

    if (disabled) {
      list.push(styles.textDisabled);
    }

    if (textStyle) list.push(textStyle);

    return list;
  };

  const getLoaderColor = () => {
    if (variant === 'outline' || variant === 'ghost') return colors.primaryBlue;
    return colors.white;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      disabled={disabled || loading}
      style={getContainerStyle()}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getLoaderColor()} />
      ) : (
        <>
          {leftIcon ? leftIcon : null}
          <Text numberOfLines={2} style={getTextStyle()}>{title}</Text>
          {rightIcon ? rightIcon : null}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    gap: spacing.xs,
  },
  sizeSm: {
    minHeight: 36,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radii.sm,
  },
  sizeMd: {
    minHeight: 46,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radii.md,
  },
  sizeLg: {
    minHeight: 52,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: radii.card,
  },
  primary: {
    backgroundColor: colors.primaryBlue,
    shadowColor: colors.primaryBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  secondary: {
    backgroundColor: colors.primaryNavy,
    shadowColor: colors.primaryNavy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  outline: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.primaryBlue,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.error,
  },
  disabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  textBase: {
    textAlign: 'center',
  },
  textWhite: {
    color: colors.white,
    fontWeight: '600',
  },
  textPrimary: {
    color: colors.primaryBlue,
    fontWeight: '600',
  },
  textGhost: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  textDisabled: {
    color: colors.textMuted,
  },
});
