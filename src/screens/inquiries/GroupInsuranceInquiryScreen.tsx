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

export const GroupInsuranceInquiryScreen: React.FC = () => {
  const navigation = useNavigation();

  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState<'corporate' | 'startup' | 'ngo' | 'association' | 'educational'>('association');
  const [memberCount, setMemberCount] = useState('');
  const [category, setCategory] = useState('Group Health & Accidental');
  const [contactPerson, setContactPerson] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<any>(null);

  const orgTypes = [
    { id: 'association', label: 'Registered Association' },
    { id: 'startup', label: 'Startup Team' },
    { id: 'ngo', label: 'NGO / Trust' },
    { id: 'educational', label: 'Educational Institute' },
    { id: 'corporate', label: 'Private Enterprise' },
  ];

  const handleSubmit = async () => {
    if (!orgName.trim() || !contactPerson.trim() || !businessEmail.trim()) {
      Alert.alert('Required Fields', 'Please complete the organization and contact details.');
      return;
    }
    const cleanPhone = contactNumber.trim().replace(/\D/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const result = await supportService.submitGroupInquiry({
        organizationName: orgName,
        organizationType: orgType,
        memberCount: parseInt(memberCount, 10) || 25,
        category,
        contactPerson,
        businessEmail,
        contactNumber: cleanPhone,
        city: city || 'New Delhi',
        additionalNotes: notes,
      });
      setSubmitted(result);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not submit inquiry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Group Insurance Inquiry" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.banner}>
          <MaterialCommunityIcons name="account-group" size={32} color={colors.primaryBlue} />
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Group Plans for Societies & Teams</Text>
            <Text style={styles.bannerSub}>
              Customized group coverage with day 1 pre-existing condition waivers and competitive institutional rates.
            </Text>
          </View>
        </View>

        {submitted ? (
          <View style={styles.confirmedBox}>
            <Ionicons name="checkmark-circle" size={70} color={colors.success} />
            <Text style={styles.confirmedTitle}>Inquiry Received!</Text>
            <Text style={styles.confirmedSub}>
              Thank you, {submitted.contactPerson}. Our group underwriting relationship manager will connect with you at {submitted.businessEmail} within 1 business day.
            </Text>
            <View style={styles.refBox}>
              <Text style={styles.refLabel}>INQUIRY REFERENCE</Text>
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
            <Text style={styles.sectionHeading}>Organization Information</Text>

            <Input
              label="Organization / Association Name"
              value={orgName}
              onChangeText={setOrgName}
              placeholder="e.g. Green Valley Residents Welfare Association"
            />

            <Text style={styles.inputLabel}>Organization Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typesScroll}>
              {orgTypes.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => setOrgType(t.id as any)}
                  style={[styles.typeChip, orgType === t.id && styles.typeChipActive]}
                >
                  <Text style={[styles.typeChipText, orgType === t.id && styles.typeChipTextActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <Input
                  label="Approx Member Count"
                  value={memberCount}
                  onChangeText={setMemberCount}
                  keyboardType="numeric"
                  placeholder="e.g. 35"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="City / Location"
                  value={city}
                  onChangeText={setCity}
                  placeholder="e.g. Bengaluru"
                />
              </View>
            </View>

            <Text style={[styles.sectionHeading, { marginTop: spacing.md }]}>Contact Coordinator</Text>

            <Input
              label="Contact Person Name"
              value={contactPerson}
              onChangeText={setContactPerson}
              placeholder="e.g. Amit Kapoor"
            />

            <Input
              label="Official / Business Email"
              value={businessEmail}
              onChangeText={setBusinessEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="e.g. amit@association.org"
            />

            <Input
              label="Contact Mobile Number"
              prefix="+91"
              value={contactNumber}
              onChangeText={setContactNumber}
              keyboardType="phone-pad"
              maxLength={10}
              placeholder="10-digit number"
            />

            <Input
              label="Specific Requirements / Remarks"
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Need coverage for senior citizen society members with OPD benefits"
              multiline={true}
              style={{ minHeight: 60 }}
            />

            <Button
              title="Submit Group Inquiry"
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
  inputLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  typesScroll: {
    marginBottom: spacing.md,
  },
  typeChip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
    marginRight: spacing.xs + 2,
  },
  typeChipActive: {
    backgroundColor: colors.primaryNavy,
    borderColor: colors.primaryNavy,
  },
  typeChipText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  typeChipTextActive: {
    color: colors.white,
  },
  row: {
    flexDirection: 'row',
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
