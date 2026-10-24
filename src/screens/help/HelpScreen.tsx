import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { demoGeneralFaqs } from '../../data/demoFaqs';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HelpScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
            <Text style={styles.headerTitle}>Help & Support</Text>
            <Text style={styles.headerSubtitle}>FAQs, guides, glossary, and customer support</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Quick Resource Cards */}
        <View style={styles.resourcesRow}>
          <TouchableOpacity
            onPress={() => navigation.navigate('HelpGlossary')}
            style={styles.resourceCard}
          >
            <View style={[styles.resourceIcon, { backgroundColor: colors.lightBlueBg }]}>
              <MaterialCommunityIcons name="book-open-variant" size={24} color={colors.primaryBlue} />
            </View>
            <Text style={styles.resourceTitle}>Insurance Glossary</Text>
            <Text style={styles.resourceSub}>Understand co-pay, room rent caps, & deductible</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('ContactSupport')}
            style={styles.resourceCard}
          >
            <View style={[styles.resourceIcon, { backgroundColor: '#E8F5E9' }]}>
              <MaterialCommunityIcons name="headset" size={24} color={colors.success} />
            </View>
            <Text style={styles.resourceTitle}>Contact Support</Text>
            <Text style={styles.resourceSub}>Talk to an executive or raise a grievance</Text>
          </TouchableOpacity>
        </View>

        {/* Step-by-Step Guides Section */}
        <View style={styles.guidesSection}>
          <Text style={styles.sectionHeading}>How It Works</Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('MainTabs', { screen: 'ExploreTab' } as any)}
            style={styles.guideItem}
          >
            <MaterialCommunityIcons name="shield-search" size={22} color={colors.primaryNavy} />
            <View style={{ flex: 1 }}>
              <Text style={styles.guideTitle}>How to Buy an Insurance Policy</Text>
              <Text style={styles.guideSub}>Explore plans → Compare → Fill digital proposal → Instant review</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('RenewPolicy', {})}
            style={styles.guideItem}
          >
            <MaterialCommunityIcons name="refresh-circle" size={22} color={colors.primaryNavy} />
            <View style={{ flex: 1 }}>
              <Text style={styles.guideTitle}>How to Renew Your Policy</Text>
              <Text style={styles.guideSub}>Enter policy number → Verify with insurer → Pay renewal safely</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('PortExistingPolicy', {})}
            style={styles.guideItem}
          >
            <MaterialCommunityIcons name="swap-horizontal" size={22} color={colors.primaryNavy} />
            <View style={{ flex: 1 }}>
              <Text style={styles.guideTitle}>How Policy Portability Works</Text>
              <Text style={styles.guideSub}>Transfer credits from old to new insurer under IRDAI guidelines</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Frequently Asked Questions */}
        <View style={styles.faqsSection}>
          <Text style={styles.sectionHeading}>Frequently Asked Questions</Text>

          {demoGeneralFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <TouchableOpacity
                key={faq.id}
                activeOpacity={0.8}
                onPress={() => setExpandedId(isExpanded ? null : faq.id)}
                style={styles.faqCard}
              >
                <View style={styles.faqHeader}>
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
    marginBottom: spacing.xs,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  resourcesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  resourceCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  resourceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  resourceTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  resourceSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  guidesSection: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionHeading: {
    ...typography.h3,
    color: colors.primaryNavy,
    marginBottom: spacing.sm,
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  guideTitle: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.primaryNavy,
  },
  guideSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  faqsSection: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  faqCard: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingVertical: spacing.sm + 2,
  },
  faqHeader: {
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
    lineHeight: 19,
    marginTop: spacing.xs,
  },
});
