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

export const ContactSupportScreen: React.FC = () => {
  const navigation = useNavigation();

  const [category, setCategory] = useState<'policy' | 'claim' | 'renewal' | 'portability' | 'general'>('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [ticketResult, setTicketResult] = useState<any>(null);

  const categories = [
    { id: 'general', label: 'General Inquiry' },
    { id: 'claim', label: 'Claim Assistance' },
    { id: 'renewal', label: 'Renewal Support' },
    { id: 'portability', label: 'Portability Query' },
  ];

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Required', 'Please enter a subject and your message');
      return;
    }

    setLoading(true);
    try {
      const ticket = await supportService.submitSupportTicket({
        category,
        subject,
        message,
      });
      setTicketResult(ticket);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not submit support ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Contact Support" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Support Helpdesk Numbers Card */}
        <View style={styles.contactInfoCard}>
          <Text style={styles.contactHeading}>InsureEase Support Desk</Text>

          <View style={styles.contactRow}>
            <Ionicons name="call" size={18} color={colors.primaryBlue} />
            <Text style={styles.contactValue}>1800-103-5599 (Toll Free, 9 AM - 9 PM)</Text>
          </View>

          <View style={styles.contactRow}>
            <Ionicons name="mail" size={18} color={colors.primaryBlue} />
            <Text style={styles.contactValue}>support@insureease.in</Text>
          </View>

          <View style={styles.contactRow}>
            <MaterialCommunityIcons name="shield-account" size={18} color={colors.primaryBlue} />
            <Text style={styles.contactValue}>Grievance Officer: grievance@insureease.in</Text>
          </View>
        </View>

        {ticketResult ? (
          <View style={styles.ticketSuccessCard}>
            <Ionicons name="checkmark-circle" size={60} color={colors.success} />
            <Text style={styles.ticketTitle}>Ticket Created</Text>
            <Text style={styles.ticketNumber}>Ref: {ticketResult.ticketNumber}</Text>
            <Text style={styles.ticketDesc}>
              Our support team has logged your query under "{ticketResult.subject}". You will receive an update within 4 business hours.
            </Text>
            <Button
              title="Done"
              onPress={() => navigation.goBack()}
              variant="primary"
              size="md"
              style={{ marginTop: spacing.md, width: '100%' }}
            />
          </View>
        ) : (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Submit a Request or Callback</Text>

            <Text style={styles.label}>Select Category</Text>
            <View style={styles.categoryChipsRow}>
              {categories.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setCategory(c.id as any)}
                  style={[styles.chip, category === c.id && styles.chipActive]}
                >
                  <Text style={[styles.chipText, category === c.id && styles.chipTextActive]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Subject / Topic"
              value={subject}
              onChangeText={setSubject}
              placeholder="e.g. Query regarding pre-existing waiting period"
            />

            <Input
              label="Message or Details"
              value={message}
              onChangeText={setMessage}
              placeholder="Provide policy number if applicable and details of your request"
              multiline={true}
              style={{ minHeight: 90 }}
            />

            <Button
              title="Submit Support Request"
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
  contactInfoCard: {
    backgroundColor: colors.primaryNavy,
    borderRadius: radii.card,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  contactHeading: {
    ...typography.h3,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 4,
  },
  contactValue: {
    ...typography.bodySmall,
    color: '#DCE6F5',
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  formTitle: {
    ...typography.h3,
    color: colors.primaryNavy,
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  categoryChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
    marginBottom: spacing.md,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
  },
  chipActive: {
    backgroundColor: colors.primaryBlue,
    borderColor: colors.primaryBlue,
  },
  chipText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  chipTextActive: {
    color: colors.white,
  },
  ticketSuccessCard: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
  },
  ticketTitle: {
    ...typography.h2,
    color: colors.primaryNavy,
    marginTop: spacing.sm,
  },
  ticketNumber: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primaryBlue,
    marginTop: 2,
  },
  ticketDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 18,
  },
});
