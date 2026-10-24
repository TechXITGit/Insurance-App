import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { insuranceCategories } from '../../data/insuranceCategories';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { quoteService } from '../../services/quoteService';
import { InsuranceQuote } from '../../types/insurance';
import { formatCurrency } from '../../utils/formatters';
import { useAuthStore } from '../../store/authStore';

type QuoteRouteProp = RouteProp<RootStackParamList, 'QuoteEligibility'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const QuoteEligibilityScreen: React.FC = () => {
  const route = useRoute<QuoteRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { categoryId } = route.params;

  const { isAuthenticated, setPendingAction } = useAuthStore();

  const category = insuranceCategories.find((c) => c.id === categoryId) || insuranceCategories[0];

  const [age, setAge] = useState('');
  const [pincode, setPincode] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [tobaccoUser, setTobaccoUser] = useState(false);
  const [selectedSumInsured, setSelectedSumInsured] = useState(1000000);

  const [loading, setLoading] = useState(false);
  const [quotes, setQuotes] = useState<InsuranceQuote[]>([]);
  const [hasCalculated, setHasCalculated] = useState(false);

  const sumInsuredTiers = [500000, 1000000, 1500000, 2500000, 5000000, 10000000];

  const handleCalculate = async () => {
    if (!age.trim()) {
      Alert.alert('Required Field', 'Please enter your age.');
      return;
    }
    if (!pincode.trim() || pincode.trim().length < 6) {
      Alert.alert('Required Field', 'Please enter a valid 6-digit postal pincode.');
      return;
    }
    const ageNum = parseInt(age, 10) || 30;
    setLoading(true);
    try {
      const results = await quoteService.calculateIndicativeQuote({
        categoryId: category.id,
        age: ageNum,
        pincode: pincode.trim(),
        gender,
        tobaccoUser,
        sumInsured: selectedSumInsured,
      });
      setQuotes(results);
      setHasCalculated(true);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (planId: string) => {
    if (!isAuthenticated) {
      setPendingAction({
        type: 'APPLY',
        planId,
        categoryId: category.id,
        timestamp: Date.now(),
      });
      navigation.navigate('Login', {
        returnScreen: 'ApplicationForm',
        returnParams: { planId },
      });
    } else {
      navigation.navigate('ApplicationForm', { planId });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Indicative Quote Calculator" subtitle={category.name} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Intro Card */}
        <View style={styles.introCard}>
          <MaterialCommunityIcons name="calculator-variant-outline" size={26} color={colors.primaryBlue} />
          <View style={styles.introTextWrapper}>
            <Text style={styles.introTitle}>Quick Indicative Pricing</Text>
            <Text style={styles.introDesc}>
              Explore quotes without logging in. Premiums are estimated using actuarial guidelines and include 18% GST.
            </Text>
          </View>
        </View>

        {/* Input Parameters Card */}
        <View style={styles.formCard}>
          <Text style={styles.cardHeading}>Proposed Insured Details</Text>

          {/* Age & PIN Code row */}
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <Input
                label="Your Age (Years)"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                maxLength={2}
                placeholder="e.g. 30"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="PIN Code"
                value={pincode}
                onChangeText={setPincode}
                keyboardType="numeric"
                maxLength={6}
                placeholder="e.g. 110001"
              />
            </View>
          </View>

          {/* Gender selection */}
          <Text style={styles.inputLabel}>Gender</Text>
          <View style={styles.genderRow}>
            <TouchableOpacity
              onPress={() => setGender('male')}
              style={[styles.genderBtn, gender === 'male' && styles.genderBtnActive]}
            >
              <Ionicons
                name="male"
                size={16}
                color={gender === 'male' ? colors.primaryBlue : colors.textSecondary}
              />
              <Text style={[styles.genderBtnText, gender === 'male' && styles.genderBtnTextActive]}>
                Male
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setGender('female')}
              style={[styles.genderBtn, gender === 'female' && styles.genderBtnActive]}
            >
              <Ionicons
                name="female"
                size={16}
                color={gender === 'female' ? colors.primaryBlue : colors.textSecondary}
              />
              <Text style={[styles.genderBtnText, gender === 'female' && styles.genderBtnTextActive]}>
                Female
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tobacco Toggle */}
          <View style={styles.tobaccoRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.tobaccoTitle}>Tobacco / Smoking Habit</Text>
              <Text style={styles.tobaccoDesc}>Impacts underwriting factor for life and health covers</Text>
            </View>
            <TouchableOpacity
              onPress={() => setTobaccoUser(!tobaccoUser)}
              style={[styles.toggleBtn, tobaccoUser && styles.toggleBtnActive]}
            >
              <Text style={[styles.toggleText, tobaccoUser && styles.toggleTextActive]}>
                {tobaccoUser ? 'Yes' : 'No'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Desired Sum Insured */}
          <Text style={styles.inputLabel}>Desired Sum Insured</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tierScroll}>
            {sumInsuredTiers.map((tier) => (
              <TouchableOpacity
                key={tier}
                onPress={() => setSelectedSumInsured(tier)}
                style={[styles.tierChip, selectedSumInsured === tier && styles.tierChipActive]}
              >
                <Text style={[styles.tierChipText, selectedSumInsured === tier && styles.tierChipTextActive]}>
                  {formatCurrency(tier, true)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Button
            title="Calculate Indicative Quotes"
            onPress={handleCalculate}
            loading={loading}
            variant="primary"
            size="lg"
            style={{ marginTop: spacing.md }}
          />
        </View>

        {/* Calculated Results */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primaryBlue} />
            <Text style={styles.loadingText}>Computing indicative quotes...</Text>
          </View>
        ) : hasCalculated ? (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsHeading}>Calculated Quotes ({quotes.length} Plans)</Text>

            {quotes.map((q) => (
              <View key={q.planId} style={styles.quoteCard}>
                <View style={styles.quoteHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.quotePlanName}>{q.planName}</Text>
                    <Text style={styles.quoteProvider}>{q.providerName}</Text>
                  </View>
                  <View style={styles.quoteCoverBadge}>
                    <Text style={styles.quoteCoverText}>Cover: {formatCurrency(q.sumInsured, true)}</Text>
                  </View>
                </View>

                <View style={styles.quoteDivider} />

                <View style={styles.quotePricingRow}>
                  <View>
                    <Text style={styles.priceSub}>Estimated Annual</Text>
                    <Text style={styles.priceMain}>{formatCurrency(q.totalAnnualPayable)}</Text>
                    <Text style={styles.gstNote}>incl. ₹{q.gstAmount.toLocaleString()} GST</Text>
                  </View>
                  <View style={styles.monthlyBox}>
                    <Text style={styles.priceSub}>Monthly Approx</Text>
                    <Text style={styles.monthlyPrice}>{formatCurrency(q.estimatedMonthlyPremium)} / mo</Text>
                  </View>
                </View>

                <Text style={styles.disclaimerText}>{q.disclaimer}</Text>

                <View style={styles.quoteActionsRow}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('PlanDetails', { planId: q.planId })}
                    style={styles.quoteDetailsBtn}
                  >
                    <Text style={styles.quoteDetailsText}>View Plan</Text>
                  </TouchableOpacity>

                  <Button
                    title="Apply With This Quote"
                    onPress={() => handleApply(q.planId)}
                    variant="primary"
                    size="sm"
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            ))}
          </View>
        ) : null}
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
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlueBg,
    borderRadius: radii.card,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  introTextWrapper: {
    flex: 1,
  },
  introTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  introDesc: {
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
    marginBottom: spacing.md,
  },
  cardHeading: {
    ...typography.h3,
    color: colors.primaryNavy,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
  },
  inputLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  genderRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  genderBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
  },
  genderBtnActive: {
    borderColor: colors.primaryBlue,
    backgroundColor: colors.lightBlueBg,
  },
  genderBtnText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  genderBtnTextActive: {
    color: colors.primaryBlue,
    fontWeight: '700',
  },
  tobaccoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  tobaccoTitle: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  tobaccoDesc: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
  },
  toggleBtnActive: {
    backgroundColor: colors.primaryNavy,
    borderColor: colors.primaryNavy,
  },
  toggleText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: colors.white,
  },
  tierScroll: {
    marginBottom: spacing.xs,
  },
  tierChip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
    marginRight: spacing.xs + 2,
  },
  tierChipActive: {
    backgroundColor: colors.primaryNavy,
    borderColor: colors.primaryNavy,
  },
  tierChipText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  tierChipTextActive: {
    color: colors.white,
  },
  loadingBox: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  resultsContainer: {
    marginTop: spacing.sm,
  },
  resultsHeading: {
    ...typography.h3,
    color: colors.primaryNavy,
    marginBottom: spacing.xs,
  },
  quoteCard: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  quotePlanName: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  quoteProvider: {
    ...typography.caption,
    color: colors.primaryBlue,
    fontWeight: '600',
    marginTop: 2,
  },
  quoteCoverBadge: {
    backgroundColor: colors.lightBlueBg,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radii.sm,
  },
  quoteCoverText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryBlue,
  },
  quoteDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  quotePricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.xs,
  },
  priceSub: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  priceMain: {
    ...typography.h2,
    color: colors.primaryNavy,
  },
  gstNote: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
  },
  monthlyBox: {
    alignItems: 'flex-end',
  },
  monthlyPrice: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.primaryBlue,
  },
  disclaimerText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
    lineHeight: 14,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  quoteActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  quoteDetailsBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
  },
  quoteDetailsText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.primaryNavy,
  },
});
