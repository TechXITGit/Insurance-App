import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!identifier.trim()) {
      Alert.alert('Required', 'Please enter your registered mobile number or email');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Account Recovery" />

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="key-outline" size={32} color={colors.primaryBlue} />
        </View>

        <Text style={styles.title}>Reset Access</Text>
        <Text style={styles.subtitle}>
          Enter your registered mobile number or email to receive recovery instructions.
        </Text>

        {submitted ? (
          <View style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={32} color={colors.success} />
            <Text style={styles.successTitle}>Instructions Sent</Text>
            <Text style={styles.successText}>
              If an account exists for {identifier}, a verification link / OTP code has been dispatched.
            </Text>
            <Button
              title="Back to Sign In"
              onPress={() => navigation.goBack()}
              variant="primary"
              size="md"
              style={{ marginTop: spacing.md }}
            />
          </View>
        ) : (
          <View style={styles.form}>
            <Input
              label="Registered Mobile or Email"
              placeholder="e.g. 9876543210 or email@domain.com"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
            />

            <Button
              title="Send Recovery Code"
              onPress={handleSubmit}
              loading={loading}
              variant="primary"
              size="lg"
            />
          </View>
        )}
      </View>
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
    maxWidth: 300,
  },
  form: {
    width: '100%',
    maxWidth: 340,
  },
  successCard: {
    backgroundColor: colors.lightBlueBg,
    borderRadius: radii.card,
    padding: spacing.lg,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  successTitle: {
    ...typography.h3,
    color: colors.primaryNavy,
    marginTop: spacing.xs,
  },
  successText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
});
