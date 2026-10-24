import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { useInsuredProfileStore } from '../../store/insuredProfileStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { isProfileSubmitted, isHydrated } = useInsuredProfileStore();

  const [loadingPhase, setLoadingPhase] = useState(0);

  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringScaleAnim = useRef(new Animated.Value(0.9)).current;
  const ringOpacityAnim = useRef(new Animated.Value(0.7)).current;
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const badgesFadeAnim = useRef(new Animated.Value(0)).current;
  const badgesTranslateY = useRef(new Animated.Value(15)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const ctaScaleAnim = useRef(new Animated.Value(1)).current;

  const hasNavigated = useRef(false);

  const proceedToNextScreen = () => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;

    if (isProfileSubmitted) {
      navigation.replace('MainTabs');
    } else {
      navigation.replace('InsuredOnboarding');
    }
  };

  useEffect(() => {
    // 1. Initial brand entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2200,
        useNativeDriver: false,
      }),
    ]).start();

    // 2. Staggered feature badges reveal
    Animated.sequence([
      Animated.delay(450),
      Animated.parallel([
        Animated.timing(badgesFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(badgesTranslateY, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 3. Continuous pulse loop for inner shield
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    // 4. Expanding radar ring loop
    const ringLoop = Animated.loop(
      Animated.parallel([
        Animated.timing(ringScaleAnim, {
          toValue: 1.35,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(ringOpacityAnim, {
            toValue: 0.35,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacityAnim, {
            toValue: 0,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    ringLoop.start();

    // 5. Ambient floating circles
    const floatLoop1 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim1, {
          toValue: 15,
          duration: 2400,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim1, {
          toValue: 0,
          duration: 2400,
          useNativeDriver: true,
        }),
      ])
    );
    floatLoop1.start();

    const floatLoop2 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim2, {
          toValue: -18,
          duration: 2800,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim2, {
          toValue: 0,
          duration: 2800,
          useNativeDriver: true,
        }),
      ])
    );
    floatLoop2.start();

    // 6. Multi-phase loading text transitions
    const phaseTimer1 = setTimeout(() => setLoadingPhase(1), 750);
    const phaseTimer2 = setTimeout(() => setLoadingPhase(2), 1500);

    // 7. Auto advance
    const autoNavTimer = setTimeout(() => {
      proceedToNextScreen();
    }, 2400);

    return () => {
      clearTimeout(phaseTimer1);
      clearTimeout(phaseTimer2);
      clearTimeout(autoNavTimer);
      pulseLoop.stop();
      ringLoop.stop();
      floatLoop1.stop();
      floatLoop2.stop();
    };
  }, [isProfileSubmitted, isHydrated]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const getStatusMessage = () => {
    if (loadingPhase === 0) {
      return 'Securing 256-bit encrypted connection...';
    } else if (loadingPhase === 1) {
      return 'Syncing IRDAI accredited hospital networks...';
    }
    return isProfileSubmitted
      ? 'Loading personalized recommendations...'
      : 'Setting up custom insurance intake...';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Ambient background soft glowing orbs */}
      <Animated.View
        style={[
          styles.decorOrbTop,
          {
            transform: [{ translateY: floatAnim1 }, { scale: pulseAnim }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.decorOrbBottom,
          {
            transform: [{ translateY: floatAnim2 }],
          },
        ]}
      />
      <View style={styles.decorOrbCenter} />

      <TouchableOpacity
        activeOpacity={1}
        onPress={proceedToNextScreen}
        style={styles.innerContainer}
      >
        {/* Top IRDAI Regulatory Badge */}
        <Animated.View
          style={[
            styles.topTrustPill,
            {
              opacity: fadeAnim,
              transform: [{ translateY: badgesTranslateY }],
            },
          ]}
        >
          <View style={styles.topTrustIconCircle}>
            <MaterialCommunityIcons name="shield-check" size={13} color={colors.primaryBlue} />
          </View>
          <Text style={styles.topTrustPillText}>IRDAI REGULATED HEALTHCARE MARKETPLACE</Text>
        </Animated.View>

        {/* Center Brand Identity */}
        <Animated.View
          style={[
            styles.brandCenter,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Animated concentric pulse rings */}
          <View style={styles.shieldWrapper}>
            <Animated.View
              style={[
                styles.radarRing,
                {
                  transform: [{ scale: ringScaleAnim }],
                  opacity: ringOpacityAnim,
                },
              ]}
            />
            <Animated.View
              style={[
                styles.shieldGlowRing,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <View style={styles.shieldIconBox}>
                <MaterialCommunityIcons name="shield-plus" size={50} color={colors.white} />
              </View>
            </Animated.View>
          </View>

          {/* Typography */}
          <Text style={styles.brandTitle}>InsureEase</Text>
          <Text style={styles.brandTagline}>Health & Term Insurance Simplified</Text>

          {/* Staggered Trust Feature Badges */}
          <Animated.View
            style={[
              styles.valueBadgesRow,
              {
                opacity: badgesFadeAnim,
                transform: [{ translateY: badgesTranslateY }],
              },
            ]}
          >
            <View style={styles.valueBadge}>
              <View style={styles.badgeIconCircleGreen}>
                <Ionicons name="checkmark" size={10} color="#059669" />
              </View>
              <Text style={styles.valueBadgeText}>10,000+ Cashless Hospitals</Text>
            </View>
            <View style={styles.valueBadge}>
              <View style={styles.badgeIconCircleBlue}>
                <MaterialCommunityIcons name="lightning-bolt" size={10} color={colors.primaryBlue} />
              </View>
              <Text style={styles.valueBadgeText}>Instant Claim Support</Text>
            </View>
            <View style={styles.valueBadge}>
              <View style={styles.badgeIconCircleGreen}>
                <Ionicons name="checkmark" size={10} color="#059669" />
              </View>
              <Text style={styles.valueBadgeText}>Zero Room Rent Caps</Text>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Bottom Loading Progress & Tap to Continue */}
        <View style={styles.bottomSection}>
          <Text style={styles.loadingStatusText}>{getStatusMessage()}</Text>

          {/* Modern Progress Bar */}
          <View style={styles.progressBarTrack}>
            <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
          </View>

          
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  decorOrbTop: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(36, 107, 253, 0.08)',
    zIndex: 1,
  },
  decorOrbBottom: {
    position: 'absolute',
    bottom: -80,
    left: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(16, 185, 129, 0.07)',
    zIndex: 1,
  },
  decorOrbCenter: {
    position: 'absolute',
    top: '38%',
    left: '15%',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(239, 246, 255, 0.7)',
    zIndex: 1,
  },
  topTrustPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  topTrustIconCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTrustPillText: {
    ...typography.caption,
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.primaryNavy,
    letterSpacing: 0.4,
  },
  brandCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 'auto',
  },
  shieldWrapper: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  radarRing: {
    position: 'absolute',
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: 'rgba(36, 107, 253, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(36, 107, 253, 0.3)',
  },
  shieldGlowRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(36, 107, 253, 0.25)',
    shadowColor: colors.primaryBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
  },
  shieldIconBox: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    ...typography.h1,
    fontSize: 34,
    fontWeight: '900',
    color: colors.primaryNavy,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  brandTagline: {
    ...typography.bodyMedium,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontWeight: '500',
  },
  valueBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    maxWidth: 320,
  },
  valueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badgeIconCircleGreen: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIconCircleBlue: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueBadgeText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  loadingStatusText: {
    ...typography.caption,
    fontSize: 11.5,
    color: colors.textSecondary,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  progressBarTrack: {
    width: '78%',
    height: 5,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primaryBlue,
    borderRadius: 3,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: radii.full,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  continueBtnText: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryBlue,
  },
});
