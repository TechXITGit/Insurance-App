import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { demoPlans } from '../../data/demoPlans';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { PlanCard } from '../../components/insurance/PlanCard';
import { RecentlyExploredSection } from '../../components/insurance/RecentlyExploredSection';
import { useAuthStore } from '../../store/authStore';
import { useCompareStore } from '../../store/compareStore';
import { useSavedPlansStore } from '../../store/savedPlansStore';
import { useSearchStore } from '../../store/searchStore';
import { useInsuredProfileStore } from '../../store/insuredProfileStore';
import { CategoryId } from '../../types/insurance';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Curated Health & Life/Term insurance categories (Strictly Health & Personal Protection - No automotive, property, or commercial lines)
interface SeparatedInsuranceTypeItem {
  id: string;
  categoryId: CategoryId;
  name: string;
  tagline: string;
  iconName: string;
  badge: string;
  policyTypeParam?: string;
}

const SEPARATED_HEALTH_INSURANCE_TYPES: SeparatedInsuranceTypeItem[] = [
  {
    id: 'type_health',
    categoryId: 'health',
    name: 'Medical / Health Insurance',
    tagline: 'Cashless hospitalization, ICU, 500+ day-care procedures & unlimited restore',
    iconName: 'heart-pulse',
    badge: '10,000+ Hospitals',
  },
  {
    id: 'type_term',
    categoryId: 'term_assurance',
    name: 'Term Life Insurance',
    tagline: 'High sum assured pure protection cover up to 85 years for family security',
    iconName: 'shield-account',
    badge: '₹1 Cr+ Cover',
  },
  {
    id: 'type_accident',
    categoryId: 'accident',
    name: 'Personal Accident Policy',
    tagline: '24x7 worldwide cover for accidental disability, fractures & income loss',
    iconName: 'shield-alert',
    badge: 'Worldwide Cover',
  },
  {
    id: 'type_mediclaim',
    categoryId: 'mediclaim',
    name: 'Mediclaim',
    tagline: 'Direct hospitalization expense reimbursement & in-patient doctor fees',
    iconName: 'medical-bag',
    badge: 'Hospital Bills',
  },
  {
    id: 'type_senior',
    categoryId: 'health',
    name: 'Senior Citizen Health',
    tagline: 'Dedicated health cover for elderly parents (60+) with low PED waiting',
    iconName: 'human-cane',
    badge: 'Age 60+ Care',
    policyTypeParam: 'senior_citizen',
  },
  {
    id: 'type_family',
    categoryId: 'health',
    name: 'Family Floater Health',
    tagline: 'Single shared sum-insured covering spouse & dependent children together',
    iconName: 'account-group',
    badge: 'All-in-One Family',
    policyTypeParam: 'family',
  },
  {
    id: 'type_travel',
    categoryId: 'travel',
    name: 'Travel Medical Insurance',
    tagline: 'Emergency overseas hospitalization, COVID cover & medical evacuation',
    iconName: 'airplane',
    badge: 'Schengen Approved',
  },
  {
    id: 'type_riders',
    categoryId: 'riders',
    name: 'Critical Illness & Riders',
    tagline: 'Lump-sum payouts on 36+ ailments & daily hospital cash add-ons',
    iconName: 'shield-plus',
    badge: 'Lump-sum Cash',
  },
];

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { isAuthenticated, user, setPendingAction } = useAuthStore();
  const { addPlan, isInCompare } = useCompareStore();
  const { toggleSavePlan, isSaved } = useSavedPlansStore();
  const { recentSearches, addRecentSearch } = useSearchStore();
  const { profile, isProfileSubmitted } = useInsuredProfileStore();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  const handleTypePress = (item: SeparatedInsuranceTypeItem) => {
    if (item.policyTypeParam) {
      navigation.navigate('MainTabs', {
        screen: 'ExploreTab',
        params: { categoryId: item.categoryId, policyType: item.policyTypeParam },
      } as any);
    } else {
      navigation.navigate('MainTabs', {
        screen: 'ExploreTab',
        params: { categoryId: item.categoryId },
      } as any);
    }
  };

  const handleApplyPlan = (planId: string, categoryId: CategoryId) => {
    if (!isAuthenticated) {
      setPendingAction({
        type: 'APPLY',
        planId,
        categoryId,
        timestamp: Date.now(),
      });
      navigation.navigate('Login', {
        returnScreen: 'ApplicationForm',
        returnParams: { planId },
      });
    } else {
      navigation.navigate('ApplicationForm', { planId });
    }
  };

  const handleComparePlan = (plan: typeof demoPlans[0]) => {
    const res = addPlan(plan.id, plan.categoryId);
    if (!res.success && res.message) {
      Alert.alert('Compare Notice', res.message);
    } else {
      navigation.navigate('PlanComparison', {
        categoryId: plan.categoryId,
      });
    }
  };

  // Dynamically tailor recommended plans strictly to the collected person details
  const recommendedPlansWithReasons = useMemo(() => {
    let list = [...demoPlans];
    if (isProfileSubmitted && profile) {
      const ageNum = parseInt(profile.age, 10) || 30;
      const isSenior =
        profile.insuranceType === 'senior' ||
        ageNum >= 60 ||
        profile.relation === 'father' ||
        profile.relation === 'mother';
      const isFamily =
        profile.insuranceType === 'family' ||
        profile.relation === 'spouse' ||
        profile.relation === 'son' ||
        profile.relation === 'daughter';

      if (isSenior) {
        let seniorList = list.filter(
          (p) =>
            p.policyType === 'senior' ||
            p.id === 'plan_star_senior_red_carpet' ||
            p.id === 'plan_care_freedom' ||
            p.id === 'plan_care_supreme'
        );
        if (profile.hasPreExistingConditions) {
          seniorList.sort((a, b) => a.waitingPeriodPreExistingMonths - b.waitingPeriodPreExistingMonths);
        }
        return seniorList.map((plan) => {
          let reason = `🎯 Top Match for Senior (${profile.age} yrs)`;
          if (plan.id === 'plan_star_senior_red_carpet') {
            reason = profile.hasPreExistingConditions
              ? `🎯 Fastest 12-Month PED Cover for ${profile.preExistingDetails ? profile.preExistingDetails.slice(0, 30) : 'Senior conditions'}`
              : `🎯 Zero Pre-Medical Tests & 14,000+ Cashless Hospitals`;
          } else if (plan.id === 'plan_care_freedom') {
            reason = `🩺 Guaranteed Cover for Diabetes & BP (2-yr Waiting)`;
          } else if (plan.id === 'plan_care_supreme') {
            reason = `⚡ Unlimited sum-insured reload & cashless hospitalization`;
          }
          return { plan, reason };
        });
      }

      if (profile.insuranceType === 'term_assurance') {
        const termPlans = list.filter((p) => p.categoryId === 'term_assurance');
        return termPlans.map((plan) => ({
          plan,
          reason: `🛡️ ₹1 Cr+ Pure Term Cover • Section 80C Tax Savings • Low Premium for age ${profile.age}`,
        }));
      }

      if (profile.insuranceType === 'accident') {
        const accPlans = list.filter((p) => p.categoryId === 'accident');
        return accPlans.map((plan) => ({
          plan,
          reason: `🚨 24x7 Worldwide Cover for Accidental Disability & Income Replacement`,
        }));
      }

      if (profile.insuranceType === 'mediclaim') {
        const medPlans = list.filter((p) => p.categoryId === 'mediclaim');
        return medPlans.map((plan) => ({
          plan,
          reason: `🏥 Direct Hospital Bill & Doctor Fees Reimbursement in ${profile.city || 'your city'}`,
        }));
      }

      if (profile.insuranceType === 'travel') {
        const trPlans = list.filter((p) => p.categoryId === 'travel');
        return trPlans.map((plan) => ({
          plan,
          reason: `✈️ Schengen-Compliant International Medical & Emergency Hospitalization`,
        }));
      }

      if (profile.insuranceType === 'riders') {
        const riPlans = list.filter((p) => p.categoryId === 'riders');
        return riPlans.map((plan) => ({
          plan,
          reason: `💪 Instant Lump-Sum Cash Payout on 32+ Critical Ailments`,
        }));
      }

      if (isFamily) {
        const familyPlans = list.filter(
          (p) =>
            p.policyType === 'family' ||
            p.id === 'plan_optima_secure' ||
            p.id === 'plan_star_comprehensive' ||
            p.id === 'plan_care_supreme'
        );
        return familyPlans.map((plan) => ({
          plan,
          reason: `👨‍👩‍👧‍👦 All-in-One Family Floater covering ${profile.relation.toUpperCase()} & dependent members`,
        }));
      }

      if (profile.insuranceType === 'health') {
        let healthPlans = list.filter((p) => p.categoryId === 'health');
        if (profile.hasPreExistingConditions) {
          healthPlans.sort((a, b) => a.waitingPeriodPreExistingMonths - b.waitingPeriodPreExistingMonths);
        }
        return healthPlans.map((plan) => ({
          plan,
          reason: profile.hasPreExistingConditions
            ? `Matches medical profile • ${plan.waitingPeriodPreExistingMonths} Months PED Waiting`
            : `⭐ 10,000+ Cashless Hospitals & Zero Room Rent Limits`,
        }));
      }
    }

    return list.slice(0, 4).map((plan) => ({
      plan,
      reason: `Top-rated protection plan with ${plan.claimSettlementRatio}% verified settlement`,
    }));
  }, [isProfileSubmitted, profile]);

  const selectedTypeLabel = useMemo(() => {
    const match = SEPARATED_HEALTH_INSURANCE_TYPES.find(
      (t) => t.categoryId === profile.insuranceType || (profile.insuranceType === 'senior' && t.policyTypeParam === 'senior_citizen') || (profile.insuranceType === 'family' && t.policyTypeParam === 'family')
    );
    return match?.name || 'Medical Insurance';
  }, [profile.insuranceType]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        testID="home-scroll-view"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primaryBlue]} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* A. Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoRow}>
              <View style={styles.logoBadge}>
                <MaterialCommunityIcons name="shield-check" size={20} color={colors.white} />
              </View>
              <Text style={styles.brandTitle}>InsureEase</Text>
            </View>
            <Text style={styles.greetingText}>
              {isAuthenticated && (profile.fullName?.trim() || user?.fullName?.trim())
                ? `Hi, ${(profile.fullName?.trim() || user!.fullName.trim()).split(' ')[0]}`
                : 'Hi, Guest'}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => navigation.navigate('SearchResults', {})}
              style={styles.headerIconBtn}
              accessibilityLabel="Search"
            >
              <Ionicons name="search-outline" size={20} color={colors.primaryNavy} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('NotificationCenter')}
              style={styles.headerIconBtn}
              accessibilityLabel="Notifications"
            >
              <Ionicons name="notifications-outline" size={22} color={colors.primaryNavy} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (isAuthenticated) {
                  navigation.navigate('EditProfile');
                } else {
                  navigation.navigate('Login', {});
                }
              }}
              style={styles.headerIconBtn}
              accessibilityLabel="Profile"
            >
              <Ionicons name="person-circle-outline" size={24} color={colors.primaryNavy} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Top IRDAI Healthcare & Life Hero Banner (Above Recommendations) */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>IRDAI Regulated Healthcare & Life Marketplace</Text>
            </View>
            <MaterialCommunityIcons name="shield-crown" size={26} color={colors.secondaryBlue} />
          </View>

          <Text style={styles.heroHeadline}>Health & Term Life Insurance, Simplified.</Text>
          <Text style={styles.heroSubtitle}>
            Compare verified medical, hospitalization, and pure term insurance policies for yourself and your family.
          </Text>

          <View style={styles.heroHighlightsRow}>
            <View style={styles.heroHighlightItem}>
              <Ionicons name="checkmark-circle" size={14} color="#60A5FA" />
              <Text style={styles.heroHighlightText}>Cashless Hospital Network</Text>
            </View>
            <View style={styles.heroHighlightItem}>
              <Ionicons name="checkmark-circle" size={14} color="#60A5FA" />
              <Text style={styles.heroHighlightText}>Zero Room Rent Capping</Text>
            </View>
            <View style={styles.heroHighlightItem}>
              <Ionicons name="checkmark-circle" size={14} color="#60A5FA" />
              <Text style={styles.heroHighlightText}>Pure Term Life Cover</Text>
            </View>
          </View>
        </View>

        {/* Prompt Banner if user has not yet submitted intake details */}
        {!isProfileSubmitted && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('InsuredOnboarding')}
            style={styles.intakePromptBanner}
          >
            <View style={styles.intakePromptIcon}>
              <MaterialCommunityIcons name="account-search-outline" size={24} color={colors.primaryBlue} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.intakePromptTitle}>Get Tailored Recommendations</Text>
              <Text style={styles.intakePromptSub}>
                Enter the details of the person needing insurance to unlock verified personalized plans.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.primaryBlue} />
          </TouchableOpacity>
        )}

        {/* Tailored Recommendations for the Insured Person */}
        {isProfileSubmitted && (
          <View style={styles.tailoredContainer}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>
                  {profile.fullName.trim()
                    ? `Recommended for ${profile.fullName.trim().split(' ')[0]}`
                    : `Recommended for ${profile.relation.toUpperCase()}`}
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Tailored for {profile.relation.toUpperCase()} ({profile.age} yrs, {profile.city || 'India'}) • {selectedTypeLabel}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('MainTabs', { screen: 'ExploreTab' } as any)}
              >
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.plansList}>
              {recommendedPlansWithReasons.map(({ plan, reason }) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  recommendationReason={reason}
                  isInCompare={isInCompare(plan.id)}
                  isSaved={isSaved(plan.id)}
                  onPressDetails={() => navigation.navigate('PlanDetails', { planId: plan.id })}
                  onPressApply={() => handleApplyPlan(plan.id, plan.categoryId)}
                  onPressCompare={() => handleComparePlan(plan)}
                  onPressSave={() => {
                    if (!isAuthenticated) {
                      setPendingAction({
                        type: 'SAVE_PLAN',
                        planId: plan.id,
                        timestamp: Date.now(),
                      });
                      navigation.navigate('Login', {});
                    } else {
                      toggleSavePlan(plan.id);
                    }
                  }}
                />
              ))}
            </View>
          </View>
        )}

        {/* Recently Explored Insurance */}
        <RecentlyExploredSection />

        {/* E. Separated Types of Insurance to Explore (Health & Personal Protection Only) */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Explore by Insurance Type</Text>
            <Text style={styles.sectionSubtitle}>
              Exclusively health, hospitalization, personal accident, and term life protections
            </Text>
          </View>
        </View>

        <View style={styles.typesGridContainer}>
          {SEPARATED_HEALTH_INSURANCE_TYPES.map((typeItem) => (
            <TouchableOpacity
              key={typeItem.id}
              activeOpacity={0.78}
              onPress={() => handleTypePress(typeItem)}
              style={styles.typeCard}
            >
              <View style={styles.typeCardTop}>
                <View style={styles.typeIconWrapper}>
                  <MaterialCommunityIcons
                    name={typeItem.iconName as any}
                    size={24}
                    color={colors.primaryBlue}
                  />
                </View>
                <View style={styles.typePillBadge}>
                  <Text style={styles.typePillBadgeText}>{typeItem.badge}</Text>
                </View>
              </View>

              <Text style={styles.typeName}>{typeItem.name}</Text>
              <Text numberOfLines={2} style={styles.typeTagline}>
                {typeItem.tagline}
              </Text>

              <View style={styles.typeExploreLink}>
                <Text style={styles.typeExploreLinkText}>Explore Plans</Text>
                <Ionicons name="arrow-forward" size={14} color={colors.primaryBlue} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* F. Healthcare Policy Management Utilities */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Policy Continuity Services</Text>
            <Text style={styles.sectionSubtitle}>Instant renewals and IRDAI waiting-period portability</Text>
          </View>
        </View>

        <View style={styles.utilitiesRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('RenewPolicy', {})}
            style={styles.utilityCard}
          >
            <View style={styles.utilityIconBox}>
              <MaterialCommunityIcons name="refresh-circle" size={24} color={colors.primaryNavy} />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={styles.utilityTitle}>Renew Existing Policy</Text>
              <Text style={styles.utilityDesc}>Protect NCB bonus & waiting credits</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('PortExistingPolicy', {})}
            style={styles.utilityCard}
          >
            <View style={styles.utilityIconBox}>
              <MaterialCommunityIcons name="swap-horizontal" size={24} color={colors.primaryBlue} />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={styles.utilityTitle}>Port Health Policy</Text>
              <Text style={styles.utilityDesc}>Switch insurer with zero credit loss</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* G. Recommended Protection Plans (Only when profile not yet submitted) */}
        {!isProfileSubmitted && (
          <>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Recommended Protection Plans</Text>
                <Text style={styles.sectionSubtitle}>
                  Top rated medical & term covers with verified claim settlement ratios
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('MainTabs', { screen: 'ExploreTab' } as any)}
              >
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.plansList}>
              {recommendedPlansWithReasons.map(({ plan, reason }) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  recommendationReason={reason}
                  isInCompare={isInCompare(plan.id)}
                  isSaved={isSaved(plan.id)}
                  onPressDetails={() => navigation.navigate('PlanDetails', { planId: plan.id })}
                  onPressApply={() => handleApplyPlan(plan.id, plan.categoryId)}
                  onPressCompare={() => handleComparePlan(plan)}
                  onPressSave={() => {
                    if (!isAuthenticated) {
                      setPendingAction({
                        type: 'SAVE_PLAN',
                        planId: plan.id,
                        timestamp: Date.now(),
                      });
                      navigation.navigate('Login', {});
                    } else {
                      toggleSavePlan(plan.id);
                    }
                  }}
                />
              ))}
            </View>
          </>
        )}

        {/* H. Trust and Healthcare Education */}
        <View style={styles.trustSection}>
          <Text style={styles.trustTitle}>Understanding Health & Term Insurance</Text>
          <Text style={styles.trustSubtitle}>Essential knowledge before choosing your policy</Text>

          <View style={styles.trustCardsContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('HelpGlossary')}
              style={styles.trustCard}
            >
              <MaterialCommunityIcons name="book-open-page-variant" size={24} color={colors.primaryBlue} />
              <View style={styles.trustCardText}>
                <Text style={styles.trustCardTitle}>Insurance Glossary</Text>
                <Text style={styles.trustCardDesc}>Deductibles, Co-pay, Room Rent Caps, NCB explained</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('MainTabs', { screen: 'HelpTab' } as any)}
              style={styles.trustCard}
            >
              <MaterialCommunityIcons name="shield-lock-outline" size={24} color={colors.primaryBlue} />
              <View style={styles.trustCardText}>
                <Text style={styles.trustCardTitle}>Why Compare Policies?</Text>
                <Text style={styles.trustCardDesc}>Find better waiting periods, restoration, and cashless networks</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('TermsAndConditions')}
              style={styles.trustCard}
            >
              <MaterialCommunityIcons name="file-document-outline" size={24} color={colors.primaryBlue} />
              <View style={styles.trustCardText}>
                <Text style={styles.trustCardTitle}>Documents You Need</Text>
                <Text style={styles.trustCardDesc}>PAN, Aadhaar, Income Proofs, and Medical Declarations</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surfaceSubtle,
  },
  headerLeft: {
    flex: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoBadge: {
    backgroundColor: colors.primaryNavy,
    padding: 4,
    borderRadius: radii.sm,
  },
  brandTitle: {
    ...typography.h3,
    color: colors.primaryNavy,
    fontWeight: '800',
  },
  greetingText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.error,
  },
  activeProfileCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: '#C7D9F5',
    padding: spacing.md,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  activeProfileTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  activeProfileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  activeProfileBadgeText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryNavy,
    letterSpacing: 0.5,
  },
  changePersonBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.lightBlueBg,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radii.full,
  },
  changePersonText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.primaryBlue,
    fontWeight: '700',
  },
  activePersonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  personAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.lightBlueBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: '#C7D9F5',
  },
  personName: {
    ...typography.bodyLarge,
    fontWeight: '800',
    color: colors.primaryNavy,
  },
  personMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  activeTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  activeTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radii.sm,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  activeTagText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
    color: colors.primaryNavy,
  },
  pedAlertPill: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  pedAlertText: {
    color: '#B45309',
  },
  pedClearPill: {
    backgroundColor: '#D1FAE5',
    borderColor: '#A7F3D0',
  },
  pedClearText: {
    color: '#047857',
  },
  activeProfileFooter: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs + 2,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  editRecommendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    flex: 1,
  },
  editRecommendBtnText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryBlue,
  },
  profileManageLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  profileManageLinkText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  intakePromptBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    borderRadius: radii.card,
    borderWidth: 1.5,
    borderColor: colors.primaryBlue,
    padding: spacing.md,
    gap: spacing.sm,
  },
  intakePromptIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightBlueBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intakePromptTitle: {
    ...typography.bodyMedium,
    fontWeight: '800',
    color: colors.primaryNavy,
  },
  intakePromptSub: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 15,
    marginTop: 2,
  },
  heroCard: {
    backgroundColor: colors.primaryNavy,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: radii.cardLg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#1E3A8A',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  heroBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  heroBadgeText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.white,
    fontWeight: '600',
  },
  heroHeadline: {
    ...typography.h2,
    color: colors.white,
    marginBottom: 4,
  },
  heroSubtitle: {
    ...typography.bodyMedium,
    color: '#DCE6F5',
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  heroHighlightsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 2,
  },
  heroHighlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroHighlightText: {
    ...typography.caption,
    color: '#E0E7FF',
    fontSize: 11,
    fontWeight: '500',
  },
  searchSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    minHeight: 46,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  clearSearchBtn: {
    padding: 4,
  },
  searchChipsRow: {
    marginTop: spacing.xs + 2,
  },
  recentChip: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: radii.full,
    marginRight: 6,
  },
  recentChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.primaryNavy,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  viewAllText: {
    ...typography.buttonSmall,
    color: colors.primaryBlue,
  },
  typesGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    rowGap: spacing.sm,
  },
  typeCard: {
    width: '48.5%',
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
    justifyContent: 'space-between',
  },
  typeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  typeIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightBlueBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typePillBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  typePillBadgeText: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '700',
    color: colors.primaryBlue,
  },
  typeName: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primaryNavy,
    marginTop: 2,
    marginBottom: 4,
  },
  typeTagline: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
    marginBottom: spacing.sm,
  },
  typeExploreLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 'auto',
  },
  typeExploreLinkText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryBlue,
  },
  utilitiesRow: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  utilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  utilityIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  utilityTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  utilityDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tailoredContainer: {
    marginTop: spacing.sm,
  },
  plansList: {
    paddingHorizontal: spacing.md,
  },
  trustSection: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  trustTitle: {
    ...typography.h3,
    color: colors.primaryNavy,
  },
  trustSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  trustCardsContainer: {
    gap: spacing.sm,
  },
  trustCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  trustCardText: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  trustCardTitle: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.primaryNavy,
  },
  trustCardDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
