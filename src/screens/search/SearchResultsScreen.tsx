import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { demoPlans } from '../../data/demoPlans';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { PlanCard } from '../../components/insurance/PlanCard';
import { RecentlyExploredSection } from '../../components/insurance/RecentlyExploredSection';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuthStore } from '../../store/authStore';
import { useCompareStore } from '../../store/compareStore';
import { useSavedPlansStore } from '../../store/savedPlansStore';
import { useSearchStore } from '../../store/searchStore';
import { InsurancePlan } from '../../types/insurance';

type SearchResultsRouteProp = RouteProp<RootStackParamList, 'SearchResults'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SearchResultsScreen: React.FC = () => {
  const route = useRoute<SearchResultsRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { isAuthenticated, setPendingAction } = useAuthStore();
  const { addPlan, isInCompare } = useCompareStore();
  const { toggleSavePlan, isSaved } = useSavedPlansStore();
  const { addRecentSearch } = useSearchStore();

  const [query, setQuery] = useState(route.params?.query || '');

  const results = useMemo(() => {
    if (!query || query.trim() === '') return demoPlans;
    const q = query.toLowerCase().trim();
    return demoPlans.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.providerName.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.keyBenefits.some((b) => b.toLowerCase().includes(q))
    );
  }, [query]);

  const handleApply = (plan: InsurancePlan) => {
    if (!isAuthenticated) {
      setPendingAction({
        type: 'APPLY',
        planId: plan.id,
        categoryId: plan.categoryId,
        timestamp: Date.now(),
      });
      navigation.navigate('Login', {
        returnScreen: 'ApplicationForm',
        returnParams: { planId: plan.id },
      });
    } else {
      navigation.navigate('ApplicationForm', { planId: plan.id });
    }
  };

  const handleCompare = (plan: InsurancePlan) => {
    const res = addPlan(plan.id, plan.categoryId);
    if (!res.success && res.message) {
      Alert.alert('Compare Notice', res.message);
    } else {
      navigation.navigate('PlanComparison', { categoryId: plan.categoryId });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header Search Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.primaryNavy} />
        </TouchableOpacity>

        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={18} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => query.trim() && addRecentSearch(query.trim())}
            placeholder="Search plans, benefits, insurers"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            autoFocus={!route.params?.query}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Recently Explored Insurance */}
      <RecentlyExploredSection />

      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {results.length} result{results.length !== 1 ? 's' : ''} found {query ? `for "${query}"` : ''}
        </Text>
      </View>

      {/* Results List */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <PlanCard
            plan={item}
            isInCompare={isInCompare(item.id)}
            isSaved={isSaved(item.id)}
            onPressDetails={() => navigation.navigate('PlanDetails', { planId: item.id })}
            onPressApply={() => handleApply(item)}
            onPressCompare={() => handleCompare(item)}
            onPressSave={() => {
              if (!isAuthenticated) {
                setPendingAction({
                  type: 'SAVE_PLAN',
                  planId: item.id,
                  timestamp: Date.now(),
                });
                navigation.navigate('Login', {});
              } else {
                toggleSavePlan(item.id);
              }
            }}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No matching plans found"
            description={`We could not find any insurance matching "${query}". Try searching for Health, Care, Term, or Star.`}
            actionTitle="Clear Search"
            onActionPress={() => setQuery('')}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    minHeight: 42,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  countContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  countText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
});
