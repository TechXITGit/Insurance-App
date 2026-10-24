import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { Header } from '../../components/common/Header';
import { Badge } from '../../components/common/Badge';
import { demoGlossaryTerms } from '../../data/demoGlossary';

export const HelpGlossaryScreen: React.FC = () => {
  const [search, setSearch] = useState('');

  const filteredTerms = demoGlossaryTerms.filter(
    (item) =>
      !search ||
      item.term.toLowerCase().includes(search.toLowerCase()) ||
      item.definition.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Insurance Glossary" subtitle="Understand key terms and fine print" />

      {/* Search Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textSecondary} style={{ marginRight: 6 }} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search terms (e.g. co-pay, waiting period, room rent)"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredTerms}
        keyExtractor={(item) => item.term}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.termCard}>
            <View style={styles.termHeader}>
              <Text style={styles.termTitle}>{item.term}</Text>
              <Badge label={item.category} variant="info" size="sm" />
            </View>
            <Text style={styles.termDefinition}>{item.definition}</Text>
            {item.example && (
              <View style={styles.exampleBox}>
                <Text style={styles.exampleLabel}>Example:</Text>
                <Text style={styles.exampleText}>{item.example}</Text>
              </View>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
  },
  searchContainer: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm + 2,
    minHeight: 40,
  },
  searchInput: {
    flex: 1,
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  termCard: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  termHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  termTitle: {
    ...typography.h3,
    color: colors.primaryNavy,
  },
  termDefinition: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    lineHeight: 20,
    marginTop: 2,
  },
  exampleBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  exampleLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryNavy,
    marginBottom: 2,
  },
  exampleText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});
