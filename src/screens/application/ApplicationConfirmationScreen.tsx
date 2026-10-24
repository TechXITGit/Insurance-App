import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Share,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

import { Header } from '../../components/common/Header';

type ConfirmationRouteProp = RouteProp<RootStackParamList, 'ApplicationConfirmation'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ApplicationConfirmationScreen: React.FC = () => {
  const route = useRoute<ConfirmationRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { applicationId, applicationNumber } = route.params;

  const appNumber =
    applicationNumber ||
    `IN-${new Date().getFullYear()}-${applicationId.slice(-6).toUpperCase()}`;

  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `InsureEase Application Submitted successfully! Reference Number: ${appNumber}. Underwriting status is active.`,
      });
    } catch {}
  };

  const handleBackToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Application Status"
        showBack={true}
        onBackPress={handleBackToHome}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Animated Success Circle with Checkmark */}
        <Animated.View
          style={[
            styles.successIconWrapper,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <View style={styles.successOuterCircle}>
            <Ionicons name="checkmark" size={54} color={colors.white} />
          </View>
        </Animated.View>

        <Text style={styles.title}>Application Submitted Successfully</Text>
        <Text style={styles.subtitle}>
          Your insurance proposal has been registered and forwarded to the insurer underwriting desk.
        </Text>

        {/* Ref Number Card */}
        <View style={styles.refCard}>
          <Text style={styles.refLabel}>Application Reference Number</Text>
          <Text style={styles.refNumber}>{appNumber}</Text>
          <View style={{ flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs, alignItems: 'center' }}>
            <Badge label="Under Review" variant="warning" size="md" />
            <Badge label="KYC Verified" variant="success" size="md" />
          </View>
          <Text style={styles.kycClarificationText}>
            Central KYC verified. Final policy issuance and approval are completed after underwriting review.
          </Text>
        </View>

        {/* Timeline / Next Steps */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineHeading}>What Happens Next?</Text>

          <View style={styles.stepItem}>
            <View style={styles.stepBulletActive}>
              <Text style={styles.stepBulletText}>1</Text>
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitle}>Document & KYC Verification</Text>
              <Text style={styles.stepDesc}>
                Identity verified via CKYC. Medical disclosures reviewed within 24 hours.
              </Text>
            </View>
          </View>

          <View style={styles.stepLine} />

          <View style={styles.stepItem}>
            <View style={styles.stepBullet}>
              <Text style={styles.stepBulletText}>2</Text>
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitle}>Medical Underwriting Check</Text>
              <Text style={styles.stepDesc}>
                Tele-medical call scheduled only if required based on declared health history.
              </Text>
            </View>
          </View>

          <View style={styles.stepLine} />

          <View style={styles.stepItem}>
            <View style={styles.stepBullet}>
              <Text style={styles.stepBulletText}>3</Text>
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitle}>Policy Issuance & Digital Card</Text>
              <Text style={styles.stepDesc}>
                Upon approval, official IRDAI policy bond and digital cashless health card are issued.
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Button
            title="Open in My Applied Insurance"
            onPress={() =>
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: 'MainTabs',
                    params: {
                      screen: 'MyPoliciesTab',
                      params: { initialTab: 'applications' },
                    },
                  },
                ],
              })
            }
            variant="primary"
            size="lg"
            leftIcon={<MaterialCommunityIcons name="clipboard-text-clock" size={20} color={colors.white} />}
            style={styles.actionBtn}
          />

          <Button
            title="Share Reference Details"
            onPress={handleShare}
            variant="outline"
            size="md"
            leftIcon={<Ionicons name="share-social-outline" size={18} color={colors.primaryBlue} />}
            style={styles.actionBtn}
          />

          <Button
            title="Return to Home"
            onPress={() =>
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              })
            }
            variant="ghost"
            size="md"
            style={styles.actionBtn}
          />
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
    padding: spacing.lg,
    alignItems: 'center',
    paddingBottom: spacing.xxl,
  },
  successIconWrapper: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successOuterCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  title: {
    ...typography.h1,
    color: colors.primaryNavy,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    maxWidth: 320,
    lineHeight: 22,
  },
  refCard: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.md,
  },
  kycClarificationText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 16,
  },
  refLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  refNumber: {
    ...typography.h2,
    color: colors.primaryBlue,
    marginTop: 2,
    letterSpacing: 1,
  },
  timelineCard: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    width: '100%',
    marginBottom: spacing.lg,
  },
  timelineHeading: {
    ...typography.h3,
    color: colors.primaryNavy,
    marginBottom: spacing.md,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  stepBulletActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBulletText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.white,
    fontWeight: '700',
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  stepDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  stepLine: {
    width: 2,
    height: 20,
    backgroundColor: colors.borderLight,
    marginLeft: 11,
    marginVertical: 4,
  },
  actionsContainer: {
    width: '100%',
    gap: spacing.sm,
  },
  actionBtn: {
    width: '100%',
  },
});
