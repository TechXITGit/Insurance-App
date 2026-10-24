import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { Header } from '../../components/common/Header';

export const TermsAndConditionsScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Terms and Conditions" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.heading}>1. Marketplace Role & IRDAI Compliance</Text>
          <Text style={styles.paragraph}>
            InsureEase operates as an authorized digital insurance facilitation and comparison platform in India. InsureEase is not an insurance underwriter or insurance company. All policy contracts, underwriting acceptances, premium rates, and claim settlements are executed directly by the respective IRDAI-registered insurance providers.
          </Text>

          <Text style={styles.heading}>2. Non-Disclosure & Section 45</Text>
          <Text style={styles.paragraph}>
            As per Section 45 of the Insurance Act, 1938, policyholders are legally obligated to disclose all material facts regarding their medical history, pre-existing diseases, hazardous habits, and existing coverage. Any non-disclosure or misrepresentation may render the policy void and result in claim rejection.
          </Text>

          <Text style={styles.heading}>3. Indicative Quotes & Verification</Text>
          <Text style={styles.paragraph}>
            All quotes, estimates, and comparisons displayed prior to insurer underwriting confirmation are indicative. Final premiums depend on location, age, medical verification, and insurer underwriting approval.
          </Text>

          <Text style={styles.heading}>4. Renewals & Grace Periods</Text>
          <Text style={styles.paragraph}>
            Renewal continuity benefits, No Claim Bonus (NCB), and pre-existing disease credits apply provided premiums are received within the statutory 30-day grace period. Claims arising during an unrenewed lapsed period are strictly excluded.
          </Text>

          <Text style={styles.heading}>5. Free-Look Cancellation Period</Text>
          <Text style={styles.paragraph}>
            Under IRDAI regulations, retail policyholders have a 15-day free-look period (30 days for distance marketing) from the date of policy receipt to review policy terms and cancel with refund if unsatisfied.
          </Text>
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
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  heading: {
    ...typography.h3,
    color: colors.primaryNavy,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  paragraph: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
});
