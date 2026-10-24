import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { InsuranceCategory } from '../../types/insurance';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';

export interface CategoryCardProps {
  category: InsuranceCategory;
  onPress: () => void;
  variant?: 'grid' | 'list' | 'featured';
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onPress,
  variant = 'grid',
}) => {
  const icon = (category.iconName as keyof typeof MaterialCommunityIcons.glyphMap) || 'shield-check';

  if (variant === 'list') {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={styles.listContainer}
        accessibilityRole="button"
        accessibilityLabel={category.name}
      >
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name={icon} size={22} color={colors.primaryBlue} />
        </View>

        <View style={styles.listTextContainer}>
          <Text style={styles.listTitle}>{category.name}</Text>
          <Text numberOfLines={1} style={styles.listDescription}>
            {category.tagline}
          </Text>
        </View>

        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[styles.gridContainer, variant === 'featured' && styles.featuredBorder]}
      accessibilityRole="button"
      accessibilityLabel={category.name}
    >
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name={icon} size={26} color={colors.primaryBlue} />
      </View>
      <Text numberOfLines={1} style={styles.gridTitle}>
        {category.name}
      </Text>
      <Text numberOfLines={2} style={styles.gridTagline}>
        {category.tagline}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'flex-start',
    width: '48%',
    marginBottom: spacing.md,
  },
  featuredBorder: {
    borderColor: colors.secondaryBlue,
    backgroundColor: colors.lightBlueBg,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.lightBlueBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  gridTitle: {
    ...typography.h4,
    color: colors.primaryNavy,
    marginBottom: 4,
  },
  gridTagline: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 15,
  },
  listContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  listTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  listTitle: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.primaryNavy,
  },
  listDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
