import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useAuthStore } from '../../store/authStore';
import { useSavedPlansStore } from '../../store/savedPlansStore';
import { useKycStore } from '../../store/kycStore';
import { useInsuredProfileStore } from '../../store/insuredProfileStore';
import { maskPhoneNumber } from '../../utils/formatters';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { savedPlanIds, loadSavedPlans } = useSavedPlansStore();
  const { isVerified } = useKycStore();
  const { profile, isProfileSubmitted, resetProfile } = useInsuredProfileStore();

  const selectedTypeLabel = useMemo(() => {
    switch (profile.insuranceType) {
      case 'health':
        return 'Medical / Health Insurance';
      case 'term_assurance':
        return 'Term Life Insurance';
      case 'accident':
        return 'Personal Accident Cover';
      case 'senior':
        return 'Senior Citizen Health';
      case 'family':
        return 'Family Floater Health';
      case 'mediclaim':
        return 'Mediclaim';
      case 'travel':
        return 'Travel Medical Cover';
      case 'riders':
        return 'Critical Illness & Riders';
      default:
        return 'Health & Hospitalization';
    }
  }, [profile.insuranceType]);

  useEffect(() => {
    loadSavedPlans();
  }, []);

  const activeName = isAuthenticated ? (profile.fullName?.trim() || user?.fullName?.trim() || '') : '';

  const handleLogout = async () => {
    const doLogout = async () => {
      await logout();
      await resetProfile();
    };

    if (Platform.OS === 'web') {
      const confirmed =
        typeof window !== 'undefined'
          ? window.confirm('Are you sure you want to sign out of your account?')
          : true;
      if (confirmed) {
        await doLogout();
      }
      return;
    }
    Alert.alert('Sign Out', 'Are you sure you want to sign out of your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await doLogout();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) navigation.goBack();
            else navigation.navigate('MainTabs', { screen: 'HomeTab' } as any);
          }}
          style={styles.backBtn}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.primaryNavy} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Account Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Profile Card */}
        {isAuthenticated && user ? (
          <View style={styles.userCard}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {(activeName || user.fullName).charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.userInfo}>
              <View style={styles.userNameRow}>
                <Text style={styles.userName}>{activeName || user.fullName}</Text>
                {isVerified ? (
                  <Badge label="KYC Verified" variant="success" size="sm" />
                ) : (
                  <Badge label="KYC Pending" variant="warning" size="sm" />
                )}
              </View>
              <Text style={styles.userPhone}>{maskPhoneNumber(user.phone)}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('EditProfile')}
              style={styles.editProfileIcon}
            >
              <Ionicons name="create-outline" size={20} color={colors.primaryBlue} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.guestCard}>
            <View style={styles.guestIconCircle}>
              <Ionicons name="person" size={32} color={colors.primaryBlue} />
            </View>
            <Text style={styles.guestTitle}>Guest User</Text>
            <Text style={styles.guestSub}>
              Sign in to manage personal policies, track proposals, and save favorite plans.
            </Text>

            <View style={styles.guestAuthRow}>
              <Button
                title="Sign In"
                onPress={() => navigation.navigate('Login', {})}
                variant="primary"
                size="md"
                style={{ flex: 1 }}
              />
              <Button
                title="Create Account"
                onPress={() => navigation.navigate('CreateAccount', {})}
                variant="outline"
                size="md"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}

        {/* Quick Stats Row (if logged in) */}
        {isAuthenticated && (
          <View style={styles.statsRow}>
            <TouchableOpacity
              onPress={() => navigation.navigate('SavedPlans')}
              style={styles.statBox}
            >
              <Text style={styles.statNumber}>{savedPlanIds.length}</Text>
              <Text style={styles.statLabel}>Saved Plans</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('MainTabs', { screen: 'MyPoliciesTab' } as any)}
              style={styles.statBox}
            >
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Active Policies</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('NotificationCenter')}
              style={styles.statBox}
            >
              <Text style={styles.statNumber}>2</Text>
              <Text style={styles.statLabel}>Alerts</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ─── Active Insured Person & Recommendation Settings ─── */}
        <View style={styles.insuredSectionCard}>
          <View style={styles.sectionHeadingRow}>
            <Text style={styles.groupHeading}>Recommendation Profile</Text>
            {isProfileSubmitted && (
              <View style={styles.activePillBadge}>
                <View style={styles.activePulseDot} />
                <Text style={styles.activePillText}>ACTIVE INSURED</Text>
              </View>
            )}
          </View>

          {isProfileSubmitted ? (
            <View style={styles.insuredDetailsBox}>
              <View style={styles.insuredPersonRow}>
                <View style={styles.insuredAvatar}>
                  <Ionicons name="person" size={22} color={colors.primaryNavy} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.insuredPersonName}>{profile.fullName || activeName || 'Insured Person'}</Text>
                  <Text style={styles.insuredPersonMeta}>
                    {profile.relation.toUpperCase()} • {profile.age} yrs • {profile.gender.toUpperCase()} • PIN {profile.pincode} ({profile.city || 'India'})
                  </Text>
                </View>
              </View>

              <View style={styles.insuredTagsRow}>
                <View style={styles.insuredTagPill}>
                  <MaterialCommunityIcons name="shield-check" size={13} color={colors.primaryBlue} />
                  <Text style={styles.insuredTagText}>{selectedTypeLabel}</Text>
                </View>

                <View
                  style={[
                    styles.insuredTagPill,
                    profile.hasPreExistingConditions ? styles.pedAlertPill : styles.pedClearPill,
                  ]}
                >
                  <Ionicons
                    name={profile.hasPreExistingConditions ? 'alert-circle' : 'checkmark-circle'}
                    size={13}
                    color={profile.hasPreExistingConditions ? '#B45309' : '#047857'}
                  />
                  <Text
                    style={[
                      styles.insuredTagText,
                      profile.hasPreExistingConditions ? styles.pedAlertText : styles.pedClearText,
                    ]}
                  >
                    {profile.hasPreExistingConditions
                      ? 'Pre-existing Declared'
                      : 'Zero Pre-existing Conditions'}
                  </Text>
                </View>

                <View style={styles.insuredTagPill}>
                  <Ionicons name="leaf-outline" size={13} color={colors.textSecondary} />
                  <Text style={styles.insuredTagText}>
                    {profile.tobaccoUser ? 'Smoker' : 'Non-tobacco'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate('InsuredOnboarding', { isEditing: true })}
                style={styles.updateInsuredBtn}
              >
                <Ionicons name="create-outline" size={16} color={colors.white} />
                <Text style={styles.updateInsuredBtnText}>
                  Edit Details to Update Recommendations
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('InsuredOnboarding')}
              style={styles.addInsuredBanner}
            >
              <View style={styles.addInsuredIcon}>
                <MaterialCommunityIcons
                  name="account-search-outline"
                  size={24}
                  color={colors.primaryBlue}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.addInsuredTitle}>Personalize Recommendations</Text>
                <Text style={styles.addInsuredSub}>
                  Enter details of the person needing insurance to unlock tailored policies.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.primaryBlue} />
            </TouchableOpacity>
          )}
        </View>

        {/* Menu Items Group: Services & Features */}
        <View style={styles.menuGroup}>
          <Text style={styles.groupHeading}>Personal Services</Text>

          {/* KYC Verification Item */}
          <TouchableOpacity
            onPress={() => navigation.navigate('KycVerification')}
            style={styles.menuItem}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: isVerified ? '#E8F5E9' : colors.lightBlueBg }]}>
              <MaterialCommunityIcons
                name="shield-account"
                size={20}
                color={isVerified ? colors.success : colors.primaryBlue}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>My KYC Verification</Text>
            </View>
            <Badge
              label={isVerified ? 'Verified' : 'Pending'}
              variant={isVerified ? 'success' : 'warning'}
              size="sm"
            />
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('SavedPlans')}
            style={styles.menuItem}
          >
            <View style={styles.menuIconCircle}>
              <Ionicons name="bookmark-outline" size={20} color={colors.primaryBlue} />
            </View>
            <Text style={styles.menuTitle}>Saved Plans</Text>
            <Badge label={`${savedPlanIds.length}`} variant="neutral" size="sm" />
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('RenewPolicy', {})}
            style={styles.menuItem}
          >
            <View style={styles.menuIconCircle}>
              <MaterialCommunityIcons name="refresh-circle" size={20} color={colors.primaryBlue} />
            </View>
            <Text style={styles.menuTitle}>Renew Existing Policy</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('PortExistingPolicy', {})}
            style={styles.menuItem}
          >
            <View style={styles.menuIconCircle}>
              <MaterialCommunityIcons name="swap-horizontal" size={20} color={colors.primaryBlue} />
            </View>
            <Text style={styles.menuTitle}>Port Health Policy</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Menu Items Group: Support & Legal */}
        <View style={styles.menuGroup}>
          <Text style={styles.groupHeading}>Help & Information</Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('HelpGlossary')}
            style={styles.menuItem}
          >
            <View style={styles.menuIconCircle}>
              <MaterialCommunityIcons name="book-open-outline" size={20} color={colors.primaryNavy} />
            </View>
            <Text style={styles.menuTitle}>Insurance Terminology Glossary</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('ContactSupport')}
            style={styles.menuItem}
          >
            <View style={styles.menuIconCircle}>
              <MaterialCommunityIcons name="headset" size={20} color={colors.primaryNavy} />
            </View>
            <Text style={styles.menuTitle}>Contact Support & Grievance</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('TermsAndConditions')}
            style={styles.menuItem}
          >
            <View style={styles.menuIconCircle}>
              <Ionicons name="document-text-outline" size={20} color={colors.primaryNavy} />
            </View>
            <Text style={styles.menuTitle}>Terms & Conditions</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('PrivacyPolicy')}
            style={styles.menuItem}
          >
            <View style={styles.menuIconCircle}>
              <Ionicons name="shield-outline" size={20} color={colors.primaryNavy} />
            </View>
            <Text style={styles.menuTitle}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Sign Out Action if logged in */}
        {isAuthenticated && (
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.versionText}>InsureEase v1.0.0 (IRDAI Compliant Marketplace)</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  topBarTitle: {
    ...typography.h3,
    color: colors.primaryNavy,
    marginLeft: spacing.xs,
  },
  backBtn: {
    marginRight: spacing.xs,
    padding: spacing.xs,
    borderRadius: radii.sm,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  userAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryNavy,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  userAvatarText: {
    ...typography.h2,
    color: colors.white,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  userPhone: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  userEmail: {
    ...typography.caption,
    color: colors.textMuted,
  },
  editProfileIcon: {
    padding: spacing.xs,
  },
  guestCard: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  guestIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.lightBlueBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  guestTitle: {
    ...typography.h3,
    color: colors.primaryNavy,
  },
  guestSub: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: spacing.md,
    lineHeight: 18,
    maxWidth: 280,
  },
  guestAuthRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h2,
    color: colors.primaryBlue,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  menuGroup: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  groupHeading: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginVertical: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  menuIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  menuTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    flex: 1,
  },
  insuredSectionCard: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: '#C7D9F5',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activePillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  activePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  activePillText: {
    ...typography.caption,
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.primaryBlue,
    letterSpacing: 0.4,
  },
  insuredDetailsBox: {
    marginTop: 4,
  },
  insuredPersonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  insuredAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightBlueBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: '#C7D9F5',
  },
  insuredPersonName: {
    ...typography.bodyLarge,
    fontWeight: '800',
    color: colors.primaryNavy,
  },
  insuredPersonMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  insuredTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 8,
  },
  insuredTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radii.sm,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  insuredTagText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
    color: colors.primaryNavy,
  },
  pedAlertPill: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  pedAlertText: {
    color: '#B45309',
  },
  pedClearPill: {
    backgroundColor: '#D1FAE5',
    borderColor: '#A7F3D0',
  },
  pedClearText: {
    color: '#047857',
  },
  updateInsuredBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primaryBlue,
    paddingVertical: 10,
    borderRadius: radii.md,
    marginTop: spacing.xs,
  },
  updateInsuredBtnText: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  addInsuredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  addInsuredIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.lightBlueBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addInsuredTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  addInsuredSub: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    backgroundColor: '#FEE2E2',
    borderRadius: radii.card,
    marginBottom: spacing.md,
  },
  logoutText: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.error,
  },
  versionText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    marginVertical: spacing.sm,
  },
});
