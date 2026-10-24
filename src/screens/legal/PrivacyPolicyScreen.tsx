import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { Header } from '../../components/common/Header';

export const PrivacyPolicyScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Privacy Policy" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.heading}>1. Data Protection & Privacy Principles</Text>
          <Text style={styles.paragraph}>
            InsureEase is committed to safeguarding your personal and medical information. In strict compliance with Indian Data Protection laws, we do not store sensitive identification numbers (such as Aadhaar or biometric data) in ordinary unsecured storage.
          </Text>

          <Text style={styles.heading}>2. Information We Collect</Text>
          <Text style={styles.paragraph}>
            We collect personal identity information (Full Name, Contact Number, Email Address, Date of Birth), location pincodes, and declared medical history exclusively for the purpose of generating indicative quotations, underwriting verification, and policy administration.
          </Text>

          <Text style={styles.heading}>3. Sharing with Authorized Insurers</Text>
          <Text style={styles.paragraph}>
            Your proposal data is securely transmitted solely to the respective IRDAI-registered insurance company you have selected for policy issuance and claims processing. We never sell your personal information to unauthorized marketing third parties.
          </Text>

          <Text style={styles.heading}>4. Security & Secure Storage</Text>
          <Text style={styles.paragraph}>
            All API communications are protected by TLS 1.3 encryption. Mobile authentication credentials are securely managed through hardware-backed keystores on iOS and Android devices.
          </Text>

          <Text style={styles.heading}>5. Contact Grievance Officer</Text>
          <Text style={styles.paragraph}>
            If you have questions regarding data privacy or wish to request data erasure, please contact our Data Grievance Officer at privacy@insureease.in.
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
