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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { policyService } from '../../services/policyService';
import { useAuthStore } from '../../store/authStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const PortExistingPolicyScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { isAuthenticated, user, setPendingAction } = useAuthStore();

  const [currentInsurer, setCurrentInsurer] = useState('');
  const [targetInsurer, setTargetInsurer] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [currentSumInsured, setCurrentSumInsured] = useState('');
  const [requestedSumInsured, setRequestedSumInsured] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [claimsInPast3Years, setClaimsInPast3Years] = useState(false);
  const [claimDetails, setClaimDetails] = useState('');
  const [applicantName, setApplicantName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [consentAgreed, setConsentAgreed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<any>(null);

  const handleSubmit = async () => {
    if (!policyNumber.trim() || !applicantName.trim()) {
      Alert.alert('Required Fields', 'Please complete all required policy and contact details.');
      return;
    }
    if (!consentAgreed) {
      Alert.alert('Consent Required', 'Please confirm the IRDAI Portability Guidelines consent.');
      return;
    }

    if (!isAuthenticated) {
      setPendingAction({
        type: 'PORT',
        timestamp: Date.now(),
      });
      navigation.navigate('Login', { returnScreen: 'PortExistingPolicy' });
      return;
    }

    setLoading(true);
    try {
      const result = await policyService.submitPortability({
        id: `port_${Date.now()}`,
        currentInsurer,
        targetInsurer,
        policyType: 'Individual Health',
        currentPolicyNumber: policyNumber,
        currentSumInsured: parseInt(currentSumInsured, 10) || 500000,
        requestedSumInsured: parseInt(requestedSumInsured, 10) || 1000000,
        expiryDate,
        insuredMembersCount: 1,
        claimsInPast3Years,
        claimDetails,
        applicantName,
        applicantPhone: phone,
        applicantEmail: email,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
      });
      setSubmitted(result);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not submit portability request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Port Existing Policy" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.banner}>
          <MaterialCommunityIcons name="swap-horizontal" size={28} color={colors.primaryBlue} />
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>IRDAI Health Portability</Text>
            <Text style={styles.bannerSub}>
              Switch to a better insurer with higher cover without losing your pre-existing disease waiting period credits.
            </Text>
          </View>
        </View>

        {submitted ? (
          <View style={styles.confirmedBox}>
            <Ionicons name="checkmark-circle" size={70} color={colors.success} />
            <Text style={styles.confirmedTitle}>Portability Request Logged!</Text>
            <Text style={styles.confirmedSub}>
              Your transfer request from {submitted.currentInsurer} to {submitted.targetInsurer} has been submitted for underwriting credit verification.
            </Text>

            <View style={styles.receiptBox}>
              <Text style={styles.receiptLabel}>REQUEST REFERENCE</Text>
              <Text style={styles.receiptVal}>{submitted.id}</Text>
              <Text style={styles.receiptNote}>
                Our portability specialist will review your previous policy documents and submit to the receiving insurer.
              </Text>
            </View>

            <Button
              title="Track in My Policies"
              onPress={() =>
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs', params: { screen: 'MyPoliciesTab' } }],
                })
              }
              variant="primary"
              size="lg"
              style={{ width: '100%', marginTop: spacing.md }}
            />
          </View>
        ) : (
          <View>
            {/* Step 1: Current Policy Info */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>1. Current Policy Details</Text>

              <Input
                label="Current Insurance Provider"
                value={currentInsurer}
                onChangeText={setCurrentInsurer}
                placeholder="e.g. Star Health, New India, National"
              />

              <Input
                label="Current Policy Number"
                value={policyNumber}
                onChangeText={setPolicyNumber}
                placeholder="Policy Number"
                autoCapitalize="characters"
              />

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: spacing.sm }}>
                  <Input
                    label="Current Sum Insured"
                    value={currentSumInsured}
                    onChangeText={setCurrentSumInsured}
                    keyboardType="numeric"
                    prefix="₹"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Policy Expiry Date"
                    value={expiryDate}
                    onChangeText={setExpiryDate}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
              </View>

              {/* Claims toggle */}
              <View style={styles.claimsRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.claimsLabel}>Any Claims in Past 3 Years?</Text>
                  <Text style={styles.claimsSub}>Previous claims record will be requested from current insurer</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setClaimsInPast3Years(!claimsInPast3Years)}
                  style={[styles.toggleBtn, claimsInPast3Years && styles.toggleBtnActive]}
                >
                  <Text style={[styles.toggleBtnText, claimsInPast3Years && styles.toggleBtnTextActive]}>
                    {claimsInPast3Years ? 'Yes' : 'No'}
                  </Text>
                </TouchableOpacity>
              </View>

              {claimsInPast3Years && (
                <Input
                  label="Claim Details & Diagnosis"
                  value={claimDetails}
                  onChangeText={setClaimDetails}
                  placeholder="e.g. Dengue hospitalization claim ₹45,000 in 2024"
                />
              )}
            </View>

            {/* Step 2: Target Insurer & Enhancement */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>2. Target Insurer & New Cover</Text>

              <Input
                label="Preferred New Insurer"
                value={targetInsurer}
                onChangeText={setTargetInsurer}
                placeholder="e.g. Care Health Insurance, HDFC ERGO"
              />

              <Input
                label="Enhanced Desired Sum Insured"
                value={requestedSumInsured}
                onChangeText={setRequestedSumInsured}
                keyboardType="numeric"
                prefix="₹"
                helperText="Credits apply to current sum insured. Enhanced portion serves standard waiting period."
              />
            </View>

            {/* Step 3: Contact & IRDAI Guidelines Consent */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>3. Contact & Regulatory Consent</Text>

              <Input
                label="Proposer Full Name"
                value={applicantName}
                onChangeText={setApplicantName}
              />

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: spacing.sm }}>
                  <Input
                    label="Mobile Number"
                    prefix="+91"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setConsentAgreed(!consentAgreed)}
                style={styles.consentRow}
              >
                <Ionicons
                  name={consentAgreed ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={consentAgreed ? colors.primaryBlue : colors.textMuted}
                />
                <Text style={styles.consentText}>
                  I confirm this application is submitted at least 45 days prior to my policy expiry and agree to transfer accumulated waiting-period credits subject to IRDAI portability rules and underwriting acceptance.
                </Text>
              </TouchableOpacity>
            </View>

            <Button
              title="Submit Portability Request"
              onPress={handleSubmit}
              loading={loading}
              variant="primary"
              size="lg"
              style={{ marginTop: spacing.sm }}
            />
          </View>
        )}
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
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.lightBlueBg,
    borderRadius: radii.card,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  bannerTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  bannerSub: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.primaryNavy,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
  },
  claimsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  claimsLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  claimsSub: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
    maxWidth: 220,
  },
  toggleBtn: {
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
  },
  toggleBtnActive: {
    backgroundColor: colors.warning,
    borderColor: colors.warning,
  },
  toggleBtnText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  toggleBtnTextActive: {
    color: colors.white,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  consentText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  confirmedBox: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
  },
  confirmedTitle: {
    ...typography.h2,
    color: colors.primaryNavy,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  confirmedSub: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  receiptBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    padding: spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  receiptLabel: {
    ...typography.caption,
    fontSize: 9,
    color: colors.textMuted,
  },
  receiptVal: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.primaryBlue,
    marginTop: 2,
    marginBottom: 4,
  },
  receiptNote: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
