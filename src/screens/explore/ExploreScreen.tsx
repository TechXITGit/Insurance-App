import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList, MainTabParamList } from '../../types/navigation';
import { insuranceCategories } from '../../data/insuranceCategories';
import { demoPlans } from '../../data/demoPlans';
import { CategoryId, InsurancePlan } from '../../types/insurance';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { PlanCard } from '../../components/insurance/PlanCard';
import { Chip } from '../../components/common/Chip';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuthStore } from '../../store/authStore';
import { useCompareStore } from '../../store/compareStore';
import { useSavedPlansStore } from '../../store/savedPlansStore';

import { useInsuredProfileStore } from '../../store/insuredProfileStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ExploreScreenRouteProp = RouteProp<MainTabParamList, 'ExploreTab'>;

export type SortOption =
  | 'relevance'
  | 'price_asc'
  | 'price_desc'
  | 'coverage_desc'
  | 'claim_ratio_desc';

export const SORT_OPTIONS: { id: SortOption; label: string; desc: string }[] = [
  { id: 'relevance', label: 'Relevance', desc: 'Featured plans recommended for you' },
  { id: 'price_asc', label: 'Price: Low to High', desc: 'Most affordable premiums first' },
  { id: 'price_desc', label: 'Price: High to Low', desc: 'High sum-insured & premium tiers' },
  { id: 'coverage_desc', label: 'Highest Coverage', desc: 'Maximum financial protection limit' },
  { id: 'claim_ratio_desc', label: 'Claim Settlement Ratio', desc: 'Highest claim approval track record' },
];

export const HEALTH_EXPLORE_CATEGORIES: { id: CategoryId | 'all'; label: string }[] = [
  { id: 'all', label: 'All Health & Life' },
  { id: 'health', label: 'Medical / Health' },
  { id: 'term_assurance', label: 'Term Life' },
  { id: 'accident', label: 'Personal Accident' },
  { id: 'mediclaim', label: 'Mediclaim' },
  { id: 'travel', label: 'Travel Medical' },
  { id: 'riders', label: 'Critical Illness / Riders' },
];

export const ExploreScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ExploreScreenRouteProp>();
  const { isAuthenticated, setPendingAction } = useAuthStore();
  const { addPlan, isInCompare } = useCompareStore();
  const { toggleSavePlan, isSaved } = useSavedPlansStore();
  const { profile, isProfileSubmitted } = useInsuredProfileStore();

  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>(
    route.params?.categoryId || 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPolicyType, setSelectedPolicyType] = useState<string>(
    route.params?.policyType || 'all'
  );
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  useEffect(() => {
    if (route.params?.categoryId) {
      setSelectedCategory(route.params.categoryId);
    }
    if (route.params?.policyType) {
      setSelectedPolicyType(route.params.policyType);
    }
  }, [route.params?.categoryId, route.params?.policyType]);

  const filteredPlans = useMemo(() => {
    let result = [...demoPlans];

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.categoryId === selectedCategory);
    }

    // Policy Type filter
    if (selectedPolicyType !== 'all') {
      result = result.filter((p) => p.policyType === selectedPolicyType);
    }

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.providerName.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.keyBenefits.some((b) => b.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.basePremium - b.basePremium);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.basePremium - a.basePremium);
    } else if (sortBy === 'coverage_desc') {
      result.sort((a, b) => b.baseSumInsured - a.baseSumInsured);
    } else if (sortBy === 'claim_ratio_desc') {
      result.sort((a, b) => b.claimSettlementRatio - a.claimSettlementRatio);
    }

    return result;
  }, [selectedCategory, selectedPolicyType, searchQuery, sortBy]);

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
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            onPress={() => {
              if (navigation.canGoBack()) navigation.goBack();
              else navigation.navigate('MainTabs', { screen: 'HomeTab' } as any);
            }}
            style={styles.backBtn}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={colors.primaryNavy} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Explore Insurance</Text>
            <Text style={styles.headerSubtitle}>Discover and filter plans across all Indian categories</Text>
          </View>
        </View>

        {/* Search Input */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search plans, benefits, or insurers"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Active Insured Member Banner */}
        {isProfileSubmitted && (
          <View style={styles.insuredProfileBar}>
            <View style={styles.insuredProfileLeft}>
              <MaterialCommunityIcons name="account-check" size={18} color={colors.primaryBlue} />
              <Text style={styles.insuredProfileText} numberOfLines={1}>
                Insuring: <Text style={{ fontWeight: '700' }}>{profile.fullName || 'Member'}</Text> ({profile.relation.toUpperCase()}, {profile.age} yrs • PIN {profile.pincode})
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('MainTabs', { screen: 'HomeTab' } as any)}
              style={styles.changeProfileBtn}
              accessibilityLabel="Edit insured person details"
            >
              <Text style={styles.changeProfileText}>Change</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Separated Health & Term Category Horizontal Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryChipsScroll}>
          {HEALTH_EXPLORE_CATEGORIES.map((cat) => (
            <Chip
              key={cat.id}
              label={cat.label}
              selected={selectedCategory === cat.id}
              onPress={() => setSelectedCategory(cat.id)}
            />
          ))}
        </ScrollView>

        {/* Policy Type Filter Chips Row */}
        <View style={styles.policyTypesRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeScrollContent}>
            <TouchableOpacity
              onPress={() => setSelectedPolicyType('all')}
              style={[styles.smallFilterBtn, selectedPolicyType === 'all' && styles.smallFilterBtnActive]}
            >
              <Text
                style={[
                  styles.smallFilterBtnText,
                  selectedPolicyType === 'all' && styles.smallFilterBtnTextActive,
                ]}
              >
                All Types
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedPolicyType('individual')}
              style={[styles.smallFilterBtn, selectedPolicyType === 'individual' && styles.smallFilterBtnActive]}
            >
              <Text
                style={[
                  styles.smallFilterBtnText,
                  selectedPolicyType === 'individual' && styles.smallFilterBtnTextActive,
                ]}
              >
                Individual
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedPolicyType('family')}
              style={[styles.smallFilterBtn, selectedPolicyType === 'family' && styles.smallFilterBtnActive]}
            >
              <Text
                style={[
                  styles.smallFilterBtnText,
                  selectedPolicyType === 'family' && styles.smallFilterBtnTextActive,
                ]}
              >
                Family Floater
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedPolicyType('senior_citizen')}
              style={[styles.smallFilterBtn, selectedPolicyType === 'senior_citizen' && styles.smallFilterBtnActive]}
            >
              <Text
                style={[
                  styles.smallFilterBtnText,
                  selectedPolicyType === 'senior_citizen' && styles.smallFilterBtnTextActive,
                ]}
              >
                Senior Citizen
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Results Count & Sort Bar */}
        <View style={styles.countAndSortRow}>
          <View style={styles.countLeftGroup}>
            <Text style={styles.countText}>
              Showing {filteredPlans.length} plan{filteredPlans.length !== 1 ? 's' : ''}
            </Text>
            {(selectedCategory !== 'all' || selectedPolicyType !== 'all' || searchQuery.length > 0) && (
              <TouchableOpacity
                onPress={() => {
                  setSelectedCategory('all');
                  setSelectedPolicyType('all');
                  setSearchQuery('');
                  setSortBy('relevance');
                }}
                style={styles.resetBtn}
              >
                <Text style={styles.resetFiltersText}>• Reset</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Sort Selector Button */}
          <TouchableOpacity
            onPress={() => setShowSortModal(true)}
            style={styles.sortBtn}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Sort plans options"
          >
            <MaterialCommunityIcons name="sort-variant" size={16} color={colors.primaryBlue} />
            <Text style={styles.sortBtnText}>
              Sort: {SORT_OPTIONS.find((o) => o.id === sortBy)?.label.split(':')[0] || 'Relevance'}
            </Text>
            <Ionicons name="chevron-down" size={13} color={colors.primaryBlue} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Plan List */}
      <FlatList
        data={filteredPlans}
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
            description="Try modifying your category, search term, or filters to find available policies."
            actionTitle="Reset All Filters"
            onActionPress={() => {
              setSelectedCategory('all');
              setSelectedPolicyType('all');
              setSearchQuery('');
            }}
          />
        }
      />
      {/* Sort Options Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.sortModalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.sortModalHeader}>
              <View style={styles.sortTitleRow}>
                <MaterialCommunityIcons name="sort-variant" size={20} color={colors.primaryBlue} />
                <Text style={styles.sortModalTitle}>Sort Plans</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowSortModal(false)}
                style={styles.closeBtn}
                accessibilityLabel="Close sort dialog"
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.sortOptionsList}>
              {SORT_OPTIONS.map((opt) => {
                const isSelected = sortBy === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSortBy(opt.id);
                      setShowSortModal(false);
                    }}
                    style={[styles.sortOptionItem, isSelected && styles.sortOptionItemSelected]}
                  >
                    <View style={styles.sortOptionTextCol}>
                      <Text style={[styles.sortOptionLabel, isSelected && styles.sortOptionLabelSelected]}>
                        {opt.label}
                      </Text>
                      <Text style={styles.sortOptionDesc}>{opt.desc}</Text>
                    </View>
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={isSelected ? colors.primaryBlue : colors.textMuted}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  backBtn: {
    marginRight: spacing.sm,
    padding: spacing.xs,
    borderRadius: radii.sm,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.primaryNavy,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm + 4,
    minHeight: 42,
    marginBottom: spacing.sm,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  insuredProfileBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.lightBlueBg,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: '#C7D9F5',
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginBottom: spacing.xs + 2,
  },
  insuredProfileLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 6,
  },
  insuredProfileText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.primaryNavy,
  },
  changeProfileBtn: {
    backgroundColor: colors.white,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  changeProfileText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: colors.primaryBlue,
  },
  categoryChipsScroll: {
    marginBottom: spacing.xs,
  },
  policyTypesRow: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  typeScrollContent: {
    paddingRight: spacing.sm,
  },
  smallFilterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 6,
  },
  smallFilterBtnActive: {
    backgroundColor: colors.lightBlueBg,
    borderColor: colors.primaryBlue,
  },
  smallFilterBtnText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  smallFilterBtnTextActive: {
    color: colors.primaryBlue,
    fontWeight: '700',
  },
  countAndSortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs + 2,
    paddingTop: spacing.xs,
  },
  countLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 12,
  },
  resetBtn: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  resetFiltersText: {
    ...typography.caption,
    color: colors.primaryBlue,
    fontWeight: '700',
    fontSize: 12,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlueBg,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.sm,
    gap: 4,
    borderWidth: 1,
    borderColor: '#D0E5FF',
  },
  sortBtnText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.primaryBlue,
    fontWeight: '700',
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sortModalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    width: '100%',
    maxWidth: 480,
    padding: spacing.lg,
    paddingBottom: spacing.xl + 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  sortModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  sortTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortModalTitle: {
    ...typography.h3,
    color: colors.primaryNavy,
  },
  closeBtn: {
    padding: 4,
  },
  sortOptionsList: {
    gap: spacing.xs,
  },
  sortOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sortOptionItemSelected: {
    backgroundColor: colors.lightBlueBg,
    borderColor: colors.primaryBlue,
  },
  sortOptionTextCol: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  sortOptionLabel: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sortOptionLabelSelected: {
    color: colors.primaryBlue,
    fontWeight: '700',
  },
  sortOptionDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
