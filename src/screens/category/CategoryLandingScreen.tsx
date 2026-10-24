import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { insuranceCategories } from '../../data/insuranceCategories';
import { demoPlans } from '../../data/demoPlans';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { Header } from '../../components/common/Header';
import { PlanCard } from '../../components/insurance/PlanCard';
import { Button } from '../../components/common/Button';
import { useAuthStore } from '../../store/authStore';
import { useCompareStore } from '../../store/compareStore';
import { useSavedPlansStore } from '../../store/savedPlansStore';

type CategoryLandingRouteProp = RouteProp<RootStackParamList, 'CategoryLanding'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const CategoryLandingScreen: React.FC = () => {
  const route = useRoute<CategoryLandingRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { categoryId } = route.params;

  const { isAuthenticated, setPendingAction } = useAuthStore();
  const { addPlan, isInCompare } = useCompareStore();
  const { toggleSavePlan, isSaved } = useSavedPlansStore();

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const category = insuranceCategories.find((c) => c.id === categoryId) || insuranceCategories[0];
  const plans = demoPlans.filter((p) => p.categoryId === category.id);

  const handleApply = (planId: string) => {
    if (!isAuthenticated) {
      setPendingAction({
        type: 'APPLY',
        planId,
        categoryId: category.id,
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

  const handleCompare = (plan: typeof demoPlans[0]) => {
    const res = addPlan(plan.id, plan.categoryId);
    if (!res.success && res.message) {
      Alert.alert('Compare Notice', res.message);
    } else {
      navigation.navigate('PlanComparison', { categoryId: category.id });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={category.name}
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('PlanComparison', { categoryId: category.id })}
            style={styles.headerCompareBtn}
          >
            <MaterialCommunityIcons name="scale-balance" size={18} color={colors.primaryBlue} />
            <Text style={styles.headerCompareText}>Compare</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Category Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroBadge}>
            <MaterialCommunityIcons
              name={(category.iconName as any) || 'shield-outline'}
              size={24}
              color={colors.primaryBlue}
            />
          </View>
          <Text style={styles.heroTitle}>{category.name}</Text>
          <Text style={styles.heroTagline}>{category.tagline}</Text>
          <Text style={styles.heroFullDesc}>{category.fullDescription}</Text>

          {/* Quick CTA row */}
          <View style={styles.heroCtaRow}>
            <Button
              title="Get Free Quote"
              onPress={() => navigation.navigate('QuoteEligibility', { categoryId: category.id })}
              variant="primary"
              size="md"
              style={styles.quoteBtn}
            />
            <Button
              title="Talk to Support"
              onPress={() => navigation.navigate('ContactSupport')}
              variant="outline"
              size="md"
              style={styles.supportBtn}
            />
          </View>
        </View>

        {/* Who this insurance suits */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="account-check-outline" size={22} color={colors.primaryNavy} />
            <Text style={styles.sectionTitle}>Who It Suits Best</Text>
          </View>
          {category.whoItSuits.map((item, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <Ionicons name="checkmark-circle" size={16} color={colors.primaryBlue} style={styles.bulletIcon} />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Main Coverage Features */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="shield-check-outline" size={22} color={colors.primaryNavy} />
            <Text style={styles.sectionTitle}>Key Coverage Highlights</Text>
          </View>
          {category.keyFeatures.map((feat, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <View style={styles.numberBadge}>
                <Text style={styles.numberBadgeText}>{idx + 1}</Text>
              </View>
              <Text style={styles.bulletText}>{feat}</Text>
            </View>
          ))}
        </View>

        {/* Limitations & Exclusions */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="alert-circle-outline" size={22} color={colors.error} />
            <Text style={styles.sectionTitle}>Limitations & Exclusions</Text>
          </View>
          <Text style={styles.exclusionNote}>
            IRDAI rules require complete transparency regarding waiting periods and exclusions:
          </Text>
          {category.limitationsAndExclusions.map((exc, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <Ionicons name="close-circle" size={16} color={colors.error} style={styles.bulletIcon} />
              <Text style={styles.bulletText}>{exc}</Text>
            </View>
          ))}
        </View>

        {/* Available Plans in this category */}
        <View style={styles.plansHeader}>
          <Text style={styles.sectionTitle}>Available {category.name} Plans</Text>
          <Text style={styles.sectionSubtitle}>
            Compare features, sum insured options, and claim ratios
          </Text>
        </View>

        {plans.length > 0 ? (
          plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isInCompare={isInCompare(plan.id)}
              isSaved={isSaved(plan.id)}
              onPressDetails={() => navigation.navigate('PlanDetails', { planId: plan.id })}
              onPressApply={() => handleApply(plan.id)}
              onPressCompare={() => handleCompare(plan)}
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
          ))
        ) : (
          <View style={styles.inquiryCard}>
            <MaterialCommunityIcons name="clipboard-text-search-outline" size={36} color={colors.primaryBlue} />
            <Text style={styles.inquiryTitle}>Custom Underwritten Service</Text>
            <Text style={styles.inquiryDesc}>
              {category.name} is provided via authorized custom advisory and group proposals.
            </Text>
            <Button
              title="Submit Inquiry"
              onPress={() => {
                if (category.id === 'group') navigation.navigate('GroupInsuranceInquiry');
                else if (category.id === 'corporate') navigation.navigate('CorporateInsuranceInquiry');
                else navigation.navigate('ContactSupport');
              }}
              variant="primary"
              size="md"
              style={{ marginTop: spacing.md }}
            />
          </View>
        )}

        {/* Required Documents Checklist */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="file-document-check-outline" size={22} color={colors.primaryNavy} />
            <Text style={styles.sectionTitle}>Documents Checklist</Text>
          </View>
          {category.requiredDocuments.map((doc, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} style={styles.bulletIcon} />
              <Text style={styles.bulletText}>{doc}</Text>
            </View>
          ))}
        </View>

        {/* FAQs Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="frequently-asked-questions" size={22} color={colors.primaryNavy} />
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          </View>
          {category.faqs.map((faq, idx) => {
            const isExpanded = expandedFaq === idx;
            return (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.7}
                onPress={() => setExpandedFaq(isExpanded ? null : idx)}
                style={styles.faqItem}
              >
                <View style={styles.faqQuestionRow}>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.primaryNavy}
                  />
                </View>
                {isExpanded && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
              </TouchableOpacity>
            );
          })}
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
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  headerCompareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  headerCompareText: {
    ...typography.caption,
    color: colors.primaryBlue,
    fontWeight: '700',
  },
  heroBanner: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  heroBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.lightBlueBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  heroTitle: {
    ...typography.h2,
    color: colors.primaryNavy,
  },
  heroTagline: {
    ...typography.bodyMedium,
    color: colors.primaryBlue,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  heroFullDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  heroCtaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quoteBtn: {
    flex: 1,
  },
  supportBtn: {
    flex: 1,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.primaryNavy,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs + 2,
  },
  bulletIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  numberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EBF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  numberBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryBlue,
  },
  bulletText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
  exclusionNote: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  plansHeader: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  inquiryCard: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  inquiryTitle: {
    ...typography.h3,
    color: colors.primaryNavy,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  inquiryDesc: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  faqItem: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingVertical: spacing.sm,
  },
  faqQuestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.primaryNavy,
    flex: 1,
    marginRight: spacing.sm,
  },
  faqAnswer: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 19,
  },
});
