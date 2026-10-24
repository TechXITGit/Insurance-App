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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { supportService } from '../../services/supportService';
import { phoneRegex } from '../../utils/validation';

export const CorporateInsuranceInquiryScreen: React.FC = () => {
  const navigation = useNavigation();

  const [companyName, setCompanyName] = useState('');
  const [employeeCount, setEmployeeCount] = useState('');
  const [selectedCovers, setSelectedCovers] = useState<string[]>([
    'Group Medical Cover (GMC)',
    'Group Personal Accident (GPA)',
  ]);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [renewalDate, setRenewalDate] = useState('');
  const [requirementsSummary, setRequirementsSummary] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<any>(null);

  const corporateOptions = [
    'Group Medical Cover (GMC)',
    'Group Personal Accident (GPA)',
    'Group Term Life (GTL)',
    'Executive OPD & Dental Subsidies',
    'Mental Health & Teleconsultations',
    'Parents Inclusion Floater',
  ];

  const toggleCover = (cov: string) => {
    if (selectedCovers.includes(cov)) {
      setSelectedCovers(selectedCovers.filter((c) => c !== cov));
    } else {
      setSelectedCovers([...selectedCovers, cov]);
    }
  };

  const handleSubmit = async () => {
    if (!companyName.trim() || !contactName.trim() || !contactEmail.trim()) {
      Alert.alert('Required Fields', 'Please complete your company and HR contact details.');
      return;
    }
    const cleanPhone = contactPhone.trim().replace(/\D/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      Alert.alert('Invalid Mobile', 'Please provide a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await supportService.submitCorporateInquiry({
        companyName,
        employeeCount: parseInt(employeeCount, 10) || 50,
        coverageTypes: selectedCovers,
        contactName,
        contactEmail,
        contactPhone: cleanPhone,
        policyRenewalDate: renewalDate,
        requirementsSummary,
      });
      setSubmitted(res);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not submit proposal request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Corporate Health & Benefits" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.banner}>
          <MaterialCommunityIcons name="office-building" size={30} color={colors.primaryBlue} />
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Enterprise Employee Insurance</Text>
            <Text style={styles.bannerSub}>
              Modern employee medical covers with zero waiting period for pre-existing diseases, maternity, and digital cashless desks.
            </Text>
          </View>
        </View>

        {submitted ? (
          <View style={styles.confirmedBox}>
            <Ionicons name="checkmark-circle" size={70} color={colors.success} />
            <Text style={styles.confirmedTitle}>Proposal Request Received</Text>
            <Text style={styles.confirmedSub}>
              Thank you, {submitted.contactName}. Our corporate benefits lead will prepare a comparative proposal for {submitted.companyName} and email you at {submitted.contactEmail}.
            </Text>
            <View style={styles.refBox}>
              <Text style={styles.refLabel}>PROPOSAL RFP REFERENCE</Text>
              <Text style={styles.refText}>{submitted.id}</Text>
            </View>
            <Button
              title="Return to Home"
              onPress={() => navigation.goBack()}
              variant="primary"
              size="md"
              style={{ marginTop: spacing.md, width: '100%' }}
            />
          </View>
        ) : (
          <View style={styles.formCard}>
            <Text style={styles.sectionHeading}>Company & Headcount</Text>

            <Input
              label="Company Name"
              value={companyName}
              onChangeText={setCompanyName}
              placeholder="e.g. Acme Technologies Pvt Ltd"
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <Input
                  label="Employee Count"
                  value={employeeCount}
                  onChangeText={setEmployeeCount}
                  keyboardType="numeric"
                  placeholder="e.g. 75"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Policy Renewal Date"
                  value={renewalDate}
                  onChangeText={setRenewalDate}
                  placeholder="YYYY-MM-DD"
                />
              </View>
            </View>

            <Text style={[styles.sectionHeading, { marginTop: spacing.sm }]}>Requested Coverages</Text>

            {corporateOptions.map((cov) => {
              const isChecked = selectedCovers.includes(cov);
              return (
                <TouchableOpacity
                  key={cov}
                  activeOpacity={0.8}
                  onPress={() => toggleCover(cov)}
                  style={[styles.coverRow, isChecked && styles.coverRowActive]}
                >
                  <Ionicons
                    name={isChecked ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={isChecked ? colors.primaryBlue : colors.textMuted}
                  />
                  <Text style={[styles.coverText, isChecked && styles.coverTextActive]}>{cov}</Text>
                </TouchableOpacity>
              );
            })}

            <Text style={[styles.sectionHeading, { marginTop: spacing.md }]}>HR / Decision Maker Contact</Text>

            <Input
              label="Contact Person Name"
              value={contactName}
              onChangeText={setContactName}
              placeholder="e.g. Neha Verma (Head of People)"
            />

            <Input
              label="Work Email Address"
              value={contactEmail}
              onChangeText={setContactEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="e.g. neha@acmetech.in"
            />

            <Input
              label="Mobile Number"
              prefix="+91"
              value={contactPhone}
              onChangeText={setContactPhone}
              keyboardType="phone-pad"
              maxLength={10}
              placeholder="10-digit number"
            />

            <Input
              label="Additional Notes / Budget Preferences"
              value={requirementsSummary}
              onChangeText={setRequirementsSummary}
              placeholder="e.g. Looking for ₹5L base cover for employees with option for parental co-pay"
              multiline={true}
              style={{ minHeight: 60 }}
            />

            <Button
              title="Request Corporate Proposal & Callback"
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
  formCard: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  sectionHeading: {
    ...typography.h3,
    color: colors.primaryNavy,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
  },
  coverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 8,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  coverRowActive: {
    backgroundColor: colors.lightBlueBg,
    borderColor: colors.primaryBlue,
  },
  coverText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  coverTextActive: {
    fontWeight: '600',
    color: colors.primaryNavy,
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
    marginTop: spacing.sm,
  },
  confirmedSub: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  refBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
    width: '100%',
  },
  refLabel: {
    ...typography.caption,
    fontSize: 9,
    color: colors.textMuted,
  },
  refText: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.primaryBlue,
    marginTop: 2,
  },
});
