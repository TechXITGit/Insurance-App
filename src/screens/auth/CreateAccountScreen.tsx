import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuthStore } from '../../store/authStore';
import { phoneRegex } from '../../utils/validation';

type CreateAccountRouteProp = RouteProp<RootStackParamList, 'CreateAccount'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const CreateAccountScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CreateAccountRouteProp>();
  const { requestOtp } = useAuthStore();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const returnScreen = route.params?.returnScreen;
  const returnParams = route.params?.returnParams;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2) {
      errs.fullName = 'Full name must be at least 2 characters';
    }
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
      errs.phone = 'Enter a valid 10-digit Indian mobile number';
    }
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      errs.email = 'Enter a valid email address';
    }
    if (!agreedTerms) {
      errs.terms = 'Please accept Terms & Conditions and Privacy Policy';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const cleanPhone = phone.trim().replace(/\D/g, '');
      await requestOtp(cleanPhone);
      navigation.navigate('OtpVerification', {
        phone: cleanPhone,
        isNewUser: true,
        returnScreen,
        returnParams,
      });
    } catch (err: any) {
      setErrors({ form: err?.message || 'Failed to initiate account creation.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Create Account" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Join InsureEase</Text>
          <Text style={styles.subtitle}>
            Create your account to apply, track policies, and access personal claims assistance
          </Text>

          {errors.form ? <Text style={styles.formError}>{errors.form}</Text> : null}

          <View style={styles.form}>
            <Input
              label="Full Name (as per Govt ID)"
              placeholder="e.g. Rahul Sharma"
              value={fullName}
              onChangeText={setFullName}
              error={errors.fullName}
              leftIcon={<Ionicons name="person-outline" size={18} color={colors.textSecondary} />}
            />

            <Input
              label="Mobile Number"
              prefix="+91"
              placeholder="10-digit mobile"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
              error={errors.phone}
              leftIcon={<Ionicons name="call-outline" size={18} color={colors.textSecondary} />}
            />

            <Input
              label="Email Address"
              placeholder="e.g. rahul.sharma@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              leftIcon={<Ionicons name="mail-outline" size={18} color={colors.textSecondary} />}
            />

            {/* Terms and Privacy Checkbox */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setAgreedTerms(!agreedTerms)}
              style={styles.checkboxRow}
            >
              <Ionicons
                name={agreedTerms ? 'checkbox' : 'square-outline'}
                size={22}
                color={agreedTerms ? colors.primaryBlue : colors.textMuted}
              />
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text
                  style={styles.termsLink}
                  onPress={() => navigation.navigate('TermsAndConditions')}
                >
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text
                  style={styles.termsLink}
                  onPress={() => navigation.navigate('PrivacyPolicy')}
                >
                  Privacy Policy
                </Text>
                .
              </Text>
            </TouchableOpacity>
            {errors.terms ? <Text style={styles.errorText}>{errors.terms}</Text> : null}

            <Button
              title="Continue to Verification"
              onPress={handleRegister}
              loading={loading}
              variant="primary"
              size="lg"
              style={styles.submitBtn}
            />
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login', { returnScreen, returnParams })}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  title: {
    ...typography.h2,
    color: colors.primaryNavy,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  form: {
    marginBottom: spacing.lg,
  },
  formError: {
    ...typography.bodySmall,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  termsText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  termsLink: {
    color: colors.primaryBlue,
    fontWeight: '700',
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginBottom: spacing.xs,
  },
  submitBtn: {
    marginTop: spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  footerText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  footerLink: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primaryBlue,
  },
});
