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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuthStore } from '../../store/authStore';
import { phoneRegex } from '../../utils/validation';

type LoginRouteProp = RouteProp<RootStackParamList, 'Login'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<LoginRouteProp>();
  const { loginWithEmail, requestOtp, pendingAction, consumePendingAction } = useAuthStore();

  const [authMethod, setAuthMethod] = useState<'email' | 'mobile'>('email');

  // Input states initialized completely empty
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Mobile form state
  const [phone, setPhone] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const returnScreen = route.params?.returnScreen;
  const returnParams = route.params?.returnParams;

  const handlePostLoginNavigation = () => {
    const action = consumePendingAction();
    if (action) {
      if (action.type === 'APPLY' && action.planId) {
        navigation.replace('ApplicationForm', { planId: action.planId });
        return;
      }
      if (action.type === 'RENEW') {
        navigation.replace('RenewPolicy', {});
        return;
      }
      if (action.type === 'PORT') {
        navigation.replace('PortExistingPolicy', {});
        return;
      }
      if (action.type === 'MY_POLICIES') {
        navigation.replace('MainTabs', { screen: 'MyPoliciesTab' } as any);
        return;
      }
      if (action.type === 'SAVE_PLAN') {
        navigation.replace('SavedPlans');
        return;
      }
    }

    if (returnScreen) {
      navigation.replace(returnScreen as any, returnParams as any);
    } else {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.replace('MainTabs');
      }
    }
  };

  const handleEmailLogin = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password || password.length < 4) {
      setError('Please enter your password');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await loginWithEmail(email.trim(), password);
      handlePostLoginNavigation();
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMobileOtp = async () => {
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await requestOtp(cleanPhone);
      navigation.navigate('OtpVerification', {
        phone: cleanPhone,
        isNewUser: false,
        returnScreen,
        returnParams,
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Sign In"
        showBack={true}
        onBackPress={() => {
          if (navigation.canGoBack()) navigation.goBack();
          else navigation.navigate('MainTabs');
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Brand header */}
          <View style={styles.brandContainer}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="shield-lock-outline" size={32} color={colors.primaryBlue} />
            </View>
            <Text style={styles.title}>Welcome to InsureEase</Text>
            <Text style={styles.subtitle}>
              {pendingAction
                ? 'Sign in to complete your requested insurance action'
                : 'Sign in with your email or mobile to access your account'}
            </Text>
          </View>

          {/* Pending Action Alert */}
          {pendingAction ? (
            <View style={styles.pendingActionCard}>
              <Ionicons name="information-circle" size={20} color={colors.primaryBlue} />
              <Text style={styles.pendingActionText}>
                We will resume your {pendingAction.type.toLowerCase().replace('_', ' ')} request right after sign-in.
              </Text>
            </View>
          ) : null}

          {/* Method Switcher Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              onPress={() => {
                setAuthMethod('email');
                setError('');
              }}
              style={[styles.methodTab, authMethod === 'email' && styles.methodTabActive]}
            >
              <Ionicons
                name="mail-outline"
                size={16}
                color={authMethod === 'email' ? colors.primaryBlue : colors.textSecondary}
              />
              <Text style={[styles.methodTabText, authMethod === 'email' && styles.methodTabTextActive]}>
                Email & Password
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setAuthMethod('mobile');
                setError('');
              }}
              style={[styles.methodTab, authMethod === 'mobile' && styles.methodTabActive]}
            >
              <Ionicons
                name="call-outline"
                size={16}
                color={authMethod === 'mobile' ? colors.primaryBlue : colors.textSecondary}
              />
              <Text style={[styles.methodTabText, authMethod === 'mobile' && styles.methodTabTextActive]}>
                Mobile OTP
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {authMethod === 'email' ? (
              <>
                <Input
                  label="Email Address"
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (error) setError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="name@example.com"
                  error={error}
                  leftIcon={<Ionicons name="mail-outline" size={18} color={colors.textSecondary} />}
                />

                <Input
                  label="Password"
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (error) setError('');
                  }}
                  secureTextEntry={!showPassword}
                  placeholder="Enter your password"
                  leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />}
                  rightIcon={
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  }
                />

                <View style={styles.forgotRow}>
                  <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                    <Text style={styles.forgotText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>

                <Button
                  title="Sign In with Email"
                  onPress={handleEmailLogin}
                  loading={loading}
                  variant="primary"
                  size="lg"
                  style={styles.submitBtn}
                />
              </>
            ) : (
              <>
                <Input
                  label="Mobile Number"
                  prefix="+91"
                  value={phone}
                  onChangeText={(val) => {
                    setPhone(val);
                    if (error) setError('');
                  }}
                  keyboardType="phone-pad"
                  maxLength={10}
                  placeholder="10-digit number"
                  error={error}
                  leftIcon={<Ionicons name="call-outline" size={18} color={colors.textSecondary} />}
                />

                <Button
                  title="Send Verification OTP"
                  onPress={handleSendMobileOtp}
                  loading={loading}
                  variant="primary"
                  size="lg"
                  style={styles.submitBtn}
                />
              </>
            )}
          </View>

          {/* Switch to Create Account */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>New to InsureEase? </Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('CreateAccount', {
                  returnScreen,
                  returnParams,
                })
              }
            >
              <Text style={styles.footerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>

          {/* Guest continuation note */}
          <TouchableOpacity
            onPress={() => {
              if (navigation.canGoBack()) navigation.goBack();
              else navigation.navigate('MainTabs');
            }}
            style={styles.guestLink}
          >
            <Text style={styles.guestLinkText}>Continue browsing as Guest</Text>
          </TouchableOpacity>
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
    justifyContent: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.lightBlueBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.primaryNavy,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    maxWidth: 300,
  },
  pendingActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    backgroundColor: colors.lightBlueBg,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  pendingActionText: {
    ...typography.caption,
    color: colors.primaryNavy,
    flex: 1,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    padding: 3,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  methodTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: radii.sm,
    gap: 6,
  },
  methodTabActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  methodTabText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  methodTabTextActive: {
    color: colors.primaryBlue,
    fontWeight: '700',
  },
  formContainer: {
    marginBottom: spacing.lg,
  },
  forgotRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: -spacing.xs,
    marginBottom: spacing.md,
  },
  forgotText: {
    ...typography.caption,
    color: colors.primaryBlue,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: spacing.xs,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
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
  guestLink: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  guestLinkText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
