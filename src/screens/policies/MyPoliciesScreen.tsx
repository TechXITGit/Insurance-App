import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { policyService } from '../../services/policyService';
import { applicationService } from '../../services/applicationService';
import { PolicySummary, InsuranceApplication, PortabilityRequest } from '../../types/insurance';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuthStore } from '../../store/authStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const MyPoliciesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const { isAuthenticated, user, setPendingAction } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'policies' | 'applications' | 'portability'>(
    route.params?.initialTab || 'policies'
  );

  useEffect(() => {
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route.params?.initialTab]);
  const [policies, setPolicies] = useState<PolicySummary[]>([]);
  const [applications, setApplications] = useState<InsuranceApplication[]>([]);
  const [portabilities, setPortabilities] = useState<PortabilityRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (!isAuthenticated) return;
    try {
      const [pols, apps, ports] = await Promise.all([
        policyService.getUserPolicies(),
        applicationService.getUserApplications(),
        policyService.getPortabilityRequests(),
      ]);
      setPolicies(pols);
      setApplications(apps);
      setPortabilities(ports);
    } catch {}
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // If user is guest, show friendly sign-in prompt within the tab per Master Prompt Section 5
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.guestTopBar}>
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
          <Text style={styles.guestTopBarTitle}>My Policies</Text>
        </View>
        <View style={styles.guestContainer}>
          <View style={styles.guestIconCircle}>
            <MaterialCommunityIcons name="shield-account" size={48} color={colors.primaryBlue} />
          </View>
          <Text style={styles.guestTitle}>Your Insurance Dashboard</Text>
          <Text style={styles.guestSubtitle}>
            Sign in to access your digital cashless health cards, track active proposals, renew expiring policies, and monitor portability requests.
          </Text>

          <Button
            title="Sign In / Register"
            onPress={() => {
              setPendingAction({
                type: 'MY_POLICIES',
                timestamp: Date.now(),
              });
              navigation.navigate('Login', {});
            }}
            variant="primary"
            size="lg"
            style={styles.guestSignInBtn}
          />

          <Button
            title="Explore Insurance Catalog"
            onPress={() =>
              navigation.navigate('MainTabs', {
                screen: 'ExploreTab',
              } as any)
            }
            variant="outline"
            size="md"
            style={{ width: '100%', maxWidth: 280 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const renewalsDue = policies.filter((p) => p.status === 'renewal_due');

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
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
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>My Policies & Requests</Text>
            <Text style={styles.headerSubtitle}>
              {user?.fullName} • {policies.length} Active Cover(s)
            </Text>
          </View>
        </View>
      </View>

      {/* Tabs Row */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          onPress={() => setActiveTab('policies')}
          style={[styles.tabBtn, activeTab === 'policies' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabBtnText, activeTab === 'policies' && styles.tabBtnTextActive]}>
            Policies ({policies.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('applications')}
          style={[styles.tabBtn, activeTab === 'applications' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabBtnText, activeTab === 'applications' && styles.tabBtnTextActive]}>
            Applications ({applications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('portability')}
          style={[styles.tabBtn, activeTab === 'portability' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabBtnText, activeTab === 'portability' && styles.tabBtnTextActive]}>
            Portability ({portabilities.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primaryBlue]} />}
      >
        {/* Renewals Due Alert Banner if any */}
        {activeTab === 'policies' && renewalsDue.length > 0 && (
          <View style={styles.renewalAlertCard}>
            <View style={styles.renewalAlertTop}>
              <Ionicons name="warning" size={20} color={colors.warning} />
              <Text style={styles.renewalAlertTitle}>Policy Renewal Due Soon!</Text>
            </View>
            <Text style={styles.renewalAlertText}>
              {renewalsDue[0].planName} ({renewalsDue[0].policyNumber}) expires on{' '}
              {formatDate(renewalsDue[0].policyExpiryDate)}. Renew now to prevent lapse in continuity benefits.
            </Text>
            <Button
              title="Renew This Policy"
              onPress={() =>
                navigation.navigate('RenewPolicy', {
                  prefilledPolicyNumber: renewalsDue[0].policyNumber,
                  categoryId: renewalsDue[0].categoryId,
                })
              }
              variant="secondary"
              size="sm"
              style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }}
            />
          </View>
        )}

        {/* Tab 1: Policies */}
        {activeTab === 'policies' && (
          <View style={styles.tabContent}>
            {policies.map((policy) => {
              const isDue = policy.status === 'renewal_due';
              return (
                <TouchableOpacity
                  key={policy.policyId}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('PolicyDetails', { policyId: policy.policyId })}
                  style={[styles.policyCard, isDue && styles.policyCardDue]}
                >
                  <View style={styles.policyCardTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.policyProvider}>{policy.providerName}</Text>
                      <Text style={styles.policyName}>{policy.planName}</Text>
                      <Text style={styles.policyNumber}>No: {policy.policyNumber}</Text>
                    </View>
                    <Badge
                      label={isDue ? 'Renewal Due' : 'Active'}
                      variant={isDue ? 'warning' : 'success'}
                      size="sm"
                    />
                  </View>

                  <View style={styles.policyDivider} />

                  <View style={styles.policyDetailsRow}>
                    <View>
                      <Text style={styles.policyDetailLabel}>Sum Insured</Text>
                      <Text style={styles.policyDetailVal}>{formatCurrency(policy.sumInsured, true)}</Text>
                    </View>
                    <View>
                      <Text style={styles.policyDetailLabel}>Expiry Date</Text>
                      <Text style={styles.policyDetailVal}>{formatDate(policy.policyExpiryDate)}</Text>
                    </View>
                    <View>
                      <Text style={styles.policyDetailLabel}>Members</Text>
                      <Text style={styles.policyDetailVal}>{policy.insuredMembersCount} Person(s)</Text>
                    </View>
                  </View>

                  <View style={styles.policyActionsRow}>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('PolicyDetails', { policyId: policy.policyId })}
                      style={styles.cardActionBtn}
                    >
                      <Ionicons name="card-outline" size={16} color={colors.primaryBlue} />
                      <Text style={styles.cardActionText}>Digital Card & Details</Text>
                    </TouchableOpacity>

                    {isDue && (
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate('RenewPolicy', {
                            prefilledPolicyNumber: policy.policyNumber,
                            categoryId: policy.categoryId,
                          })
                        }
                        style={styles.cardRenewBtn}
                      >
                        <Text style={styles.cardRenewBtnText}>Renew Now</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Tab 2: Applications */}
        {activeTab === 'applications' && (
          <View style={styles.tabContent}>
            {applications.map((app) => (
              <View key={app.id} style={styles.appCard}>
                <View style={styles.policyCardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.policyName}>{app.planName}</Text>
                    <Text style={styles.policyNumber}>App Ref: {app.applicationNumber}</Text>
                  </View>
                  <Badge label={app.status.toUpperCase().replace('_', ' ')} variant="warning" size="sm" />
                </View>

                <View style={styles.policyDivider} />

                <Text style={styles.appSubmittedText}>
                  Submitted on {formatDate(app.submittedAt)}. Decision estimated by {formatDate(app.estimatedDecisionDate)}.
                </Text>

                {app.remarks && <Text style={styles.appRemarks}>Status note: {app.remarks}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Tab 3: Portability */}
        {activeTab === 'portability' && (
          <View style={styles.tabContent}>
            {portabilities.length > 0 ? (
              portabilities.map((port) => (
                <View key={port.id} style={styles.appCard}>
                  <View style={styles.policyCardTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.policyName}>Port to {port.targetInsurer}</Text>
                      <Text style={styles.policyNumber}>From: {port.currentInsurer} ({port.currentPolicyNumber})</Text>
                    </View>
                    <Badge label={port.status.toUpperCase()} variant="info" size="sm" />
                  </View>
                  <View style={styles.policyDivider} />
                  <Text style={styles.appRemarks}>{port.transferCreditsSummary}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <MaterialCommunityIcons name="swap-horizontal" size={40} color={colors.primaryBlue} />
                <Text style={styles.emptyCardTitle}>No Portability Requests</Text>
                <Text style={styles.emptyCardSub}>
                  Transfer your existing health policy to another insurer while retaining waiting period credits.
                </Text>
                <Button
                  title="Initiate Porting Request"
                  onPress={() => navigation.navigate('PortExistingPolicy', {})}
                  variant="primary"
                  size="md"
                  style={{ marginTop: spacing.md }}
                />
              </View>
            )}
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
  guestContainer: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.lightBlueBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  guestTitle: {
    ...typography.h2,
    color: colors.primaryNavy,
    textAlign: 'center',
  },
  guestSubtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    lineHeight: 22,
    maxWidth: 320,
  },
  guestSignInBtn: {
    width: '100%',
    maxWidth: 280,
    marginBottom: spacing.sm,
  },
  guestTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  guestTopBarTitle: {
    ...typography.h3,
    color: colors.primaryNavy,
    marginLeft: spacing.xs,
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: spacing.sm,
    padding: spacing.xs,
    borderRadius: radii.sm,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.primaryNavy,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tabBtn: {
    paddingVertical: spacing.sm + 2,
    marginRight: spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: colors.primaryBlue,
  },
  tabBtnText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabBtnTextActive: {
    color: colors.primaryBlue,
    fontWeight: '700',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  renewalAlertCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  renewalAlertTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
  },
  renewalAlertTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: '#92400E',
  },
  renewalAlertText: {
    ...typography.caption,
    color: '#78350F',
    lineHeight: 18,
  },
  tabContent: {
    gap: spacing.md,
  },
  policyCard: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  policyCardDue: {
    borderColor: '#FDBA74',
    borderWidth: 1.5,
  },
  policyCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  policyProvider: {
    ...typography.caption,
    color: colors.primaryBlue,
    fontWeight: '600',
  },
  policyName: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.primaryNavy,
    marginTop: 1,
  },
  policyNumber: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  policyDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  policyDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  policyDetailLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  policyDetailVal: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.primaryNavy,
    marginTop: 1,
  },
  policyActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  cardActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardActionText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryBlue,
  },
  cardRenewBtn: {
    backgroundColor: colors.warning,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: radii.sm,
  },
  cardRenewBtnText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.white,
  },
  appCard: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  appSubmittedText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  appRemarks: {
    ...typography.caption,
    color: colors.primaryNavy,
    fontWeight: '600',
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyCardTitle: {
    ...typography.h3,
    color: colors.primaryNavy,
    marginTop: spacing.sm,
  },
  emptyCardSub: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
});
