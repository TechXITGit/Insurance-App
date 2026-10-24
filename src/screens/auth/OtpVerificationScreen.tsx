import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
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
import { useSavedPlansStore } from '../../store/savedPlansStore';
import { maskPhoneNumber } from '../../utils/formatters';

type OtpRouteProp = RouteProp<RootStackParamList, 'OtpVerification'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const OtpVerificationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<OtpRouteProp>();
  const { phone, returnScreen, returnParams } = route.params;

  const { verifyOtp, requestOtp, consumePendingAction } = useAuthStore();
  const { toggleSavePlan } = useSavedPlansStore();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(30);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      await requestOtp(phone);
      setCooldown(30);
      Alert.alert('OTP Sent', 'A fresh verification code has been sent.');
    } catch (err: any) {
      setError(err?.message || 'Failed to resend OTP');
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP code');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await verifyOtp(phone, otp);

      // Check for pending protected action
      const pending = consumePendingAction();

      if (pending) {
        if (pending.type === 'APPLY' && pending.planId) {
          navigation.reset({
            index: 1,
            routes: [
              { name: 'MainTabs' },
              {
                name: 'ApplicationForm',
                params: { planId: pending.planId },
              },
            ],
          });
          return;
        } else if (pending.type === 'SAVE_PLAN' && pending.planId) {
          await toggleSavePlan(pending.planId);
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
          });
          return;
        } else if (pending.type === 'RENEW') {
          navigation.reset({
            index: 1,
            routes: [{ name: 'MainTabs' }, { name: 'RenewPolicy', params: pending.targetParams || {} }],
          });
          return;
        } else if (pending.type === 'PORT') {
          navigation.reset({
            index: 1,
            routes: [{ name: 'MainTabs' }, { name: 'PortExistingPolicy', params: {} }],
          });
          return;
        }
      }

      // If specific returnScreen provided
      if (returnScreen) {
        navigation.navigate(returnScreen as any, returnParams || {});
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid OTP code. Please enter 123456 in mock mode.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Verify Mobile" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Ionicons name="chatbox-ellipses-outline" size={32} color={colors.primaryBlue} />
          </View>

          <Text style={styles.title}>Enter 6-Digit Code</Text>
          <Text style={styles.subtitle}>
            Code sent to <Text style={styles.phoneHighlight}>{maskPhoneNumber(phone)}</Text>
          </Text>

          <View style={styles.form}>
            <Input
              value={otp}
              onChangeText={(val) => {
                setOtp(val);
                if (error) setError('');
              }}
              keyboardType="numeric"
              maxLength={6}
              placeholder="123456"
              error={error}
              style={styles.otpInput}
            />

            {/* Security Verification Helper */}
            <View style={styles.mockHelper}>
              <Ionicons name="shield-checkmark-outline" size={16} color={colors.primaryBlue} />
              <Text style={styles.mockHelperText}>
                Enter the 6-digit verification code sent to your registered number.
              </Text>
            </View>

            <Button
              title="Verify & Proceed"
              onPress={handleVerify}
              loading={loading}
              variant="primary"
              size="lg"
              style={styles.verifyBtn}
            />

            {/* Resend Cooldown */}
            <View style={styles.resendRow}>
              {cooldown > 0 ? (
                <Text style={styles.cooldownText}>
                  Resend code in <Text style={{ fontWeight: '700' }}>{cooldown}s</Text>
                </Text>
              ) : (
                <TouchableOpacity onPress={handleResend}>
                  <Text style={styles.resendBtnText}>Resend OTP Code</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    padding: spacing.lg,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.lightBlueBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.primaryNavy,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.xl,
  },
  phoneHighlight: {
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  form: {
    width: '100%',
    maxWidth: 340,
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 8,
    fontWeight: '700',
  },
  mockHelper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.lightBlueBg,
    borderRadius: radii.sm,
    padding: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  mockHelperText: {
    ...typography.caption,
    color: colors.primaryBlue,
    flex: 1,
  },
  verifyBtn: {
    marginTop: spacing.xs,
  },
  resendRow: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  cooldownText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  resendBtnText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.primaryBlue,
  },
});
