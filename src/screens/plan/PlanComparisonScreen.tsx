import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';
import { demoPlans } from '../../data/demoPlans';
import { insuranceCategories } from '../../data/insuranceCategories';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radii, spacing } from '../../theme/spacing';
import { Header } from '../../components/common/Header';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { formatCurrency, formatWaitingPeriod } from '../../utils/formatters';
import { useCompareStore } from '../../store/compareStore';
import { useAuthStore } from '../../store/authStore';
import { CategoryId, InsurancePlan } from '../../types/insurance';

type ComparisonRouteProp = RouteProp<RootStackParamList, 'PlanComparison'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const PlanComparisonScreen: React.FC = () => {
  const route = useRoute<ComparisonRouteProp>();
  const navigation = useNavigation<NavigationProp>();

  const { selectedPlanIds, activeCategoryId, removePlan, addPlan } = useCompareStore();
  const { isAuthenticated, setPendingAction } = useAuthStore();

  const [selectedCategory, setSelectedCategory] = useState<CategoryId>(
    route.params?.categoryId || activeCategoryId || 'health'
  );
  const [showPickerModal, setShowPickerModal] = useState(false);

  // Filter plans currently selected for the selected category - NO default preselection per user requirement
  const displayPlans: InsurancePlan[] = demoPlans.filter(
    (p) => selectedPlanIds.includes(p.id) && p.categoryId === selectedCategory
  );

  // Available plans in current category for picker
  const availableCategoryPlans = demoPlans.filter(
    (p) => p.categoryId === selectedCategory
  );

  const handleApply = (plan: InsurancePlan) => {
    if (!isAuthenticated) {
      setPendingAction({
        type: 'APPLY',
        planId: plan.id,
        categoryId: plan.categoryId,
        timestamp: Date.now(),
      });
      navigation.navigate('Login', {
        returnScreen: 'ApplicationForm',
        returnParams: { planId: plan.id },
      });
    } else {
      navigation.navigate('ApplicationForm', { planId: plan.id });
    }
  };

  const handleTogglePlanInCompare = (plan: InsurancePlan) => {
    const isCurrentlyAdded = displayPlans.some((p) => p.id === plan.id);
    if (isCurrentlyAdded) {
      removePlan(plan.id);
    } else {
      if (displayPlans.length >= 4) {
        Alert.alert('Limit Reached', 'You can compare a maximum of 4 plans at once.');
        return;
      }
      const res = addPlan(plan.id, plan.categoryId);
      if (!res.success && res.message) {
        Alert.alert('Compare Notice', res.message);
      }
    }
  };

  const handleCategorySwitch = (catId: CategoryId) => {
    setSelectedCategory(catId);
  };

  const categoryName =
    insuranceCategories.find((c) => c.id === selectedCategory)?.name || 'Insurance';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header - No Clear button per user requirement */}
      <Header
        title="Compare Plans"
        subtitle={`${categoryName} • ${displayPlans.length} of 4 plans`}
      />

      {/* Category selector pills */}
      <View style={styles.categoryPillsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryPillsList}>
          {insuranceCategories.map((cat) => {
            const isSelected = cat.id === selectedCategory;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => handleCategorySwitch(cat.id as CategoryId)}
                style={[styles.catPill, isSelected && styles.catPillActive]}
              >
                <Text style={[styles.catPillText, isSelected && styles.catPillTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Comparison Area */}
      {displayPlans.length < 2 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <MaterialCommunityIcons name="scale-balance" size={48} color={colors.primaryBlue} />
          </View>
          <Text style={styles.emptyTitle}>Select Plans to Compare</Text>
          <Text style={styles.emptyDescription}>
            Choose at least 2 {categoryName} plans to view differences in benefits, cashless networks, waiting periods, and premiums.
          </Text>

          <Button
            title="+ Choose Plans to Compare"
            variant="primary"
            size="md"
            onPress={() => setShowPickerModal(true)}
            style={styles.emptyActionBtn}
          />

          {/* Quick Select Grid */}
          <Text style={styles.quickSelectHeader}>Available {categoryName} Plans</Text>
          <ScrollView style={styles.quickSelectList}>
            {availableCategoryPlans.map((plan) => {
              const isSelected = displayPlans.some((p) => p.id === plan.id);
              return (
                <TouchableOpacity
                  key={plan.id}
                  onPress={() => handleTogglePlanInCompare(plan)}
                  style={[styles.quickPlanRow, isSelected && styles.quickPlanRowSelected]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.quickPlanProvider}>{plan.providerName}</Text>
                    <Text style={styles.quickPlanName}>{plan.name}</Text>
                    <Text style={styles.quickPlanPrice}>
                      {formatCurrency(plan.basePremium)}/yr • {formatCurrency(plan.baseSumInsured, true)} Cover
                    </Text>
                  </View>
                  <View style={[styles.quickAddBadge, isSelected && styles.quickAddBadgeSelected]}>
                    <Ionicons name={isSelected ? 'checkmark' : 'add'} size={16} color={colors.white} />
                    <Text style={styles.quickAddText}>{isSelected ? 'Added' : 'Add'}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={styles.horizontalScroll}
        >
          <View style={styles.tableContainer}>
            {/* Header Row: Attribute Label Cell + Plan Cards + Add More Card */}
            <View style={styles.comparisonRow}>
              <View style={[styles.attributeLabelCell, styles.headerLabelCell]}>
                <View>
                  <Text style={styles.sectionHeaderLabel}>Plans ({displayPlans.length}/4)</Text>
                  <Text style={styles.attributeSub}>Side-by-side details</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowPickerModal(true)}
                  style={styles.selectPlanPickerBtn}
                >
                  <Ionicons name="add-circle" size={16} color={colors.primaryBlue} />
                  <Text style={styles.selectPlanPickerBtnText}>Select Plans</Text>
                </TouchableOpacity>
              </View>

              {displayPlans.map((plan) => (
                <View key={plan.id} style={styles.planHeaderCell}>
                  <TouchableOpacity
                    onPress={() => removePlan(plan.id)}
                    style={styles.removePlanBtn}
                    accessibilityLabel={`Remove ${plan.name}`}
                  >
                    <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                  </TouchableOpacity>

                  <View style={styles.planHeaderTopContent}>
                    <Text numberOfLines={1} style={styles.planProviderName}>
                      {plan.providerName}
                    </Text>
                    <Text style={styles.planTitleName} numberOfLines={2}>
                      {plan.name}
                    </Text>
                  </View>

                  <View style={styles.planHeaderApplyBtnWrap}>
                    <Button
                      title="Apply"
                      onPress={() => handleApply(plan)}
                      variant="primary"
                      size="sm"
                      style={styles.planHeaderApplyBtn}
                    />
                  </View>
                </View>
              ))}

              {/* Slot to Add More Plans if under 4 */}
              {displayPlans.length < 4 && (
                <TouchableOpacity
                  onPress={() => setShowPickerModal(true)}
                  style={styles.addPlanSlotCard}
                >
                  <View style={styles.addIconCircle}>
                    <Ionicons name="add" size={24} color={colors.primaryBlue} />
                  </View>
                  <Text style={styles.addPlanSlotTitle}>Add Plan</Text>
                  <Text style={styles.addPlanSlotSub}>Select from {availableCategoryPlans.length} plans</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Row: Annual Premium */}
            <View style={[styles.comparisonRow, styles.altRow]}>
              <View style={styles.attributeLabelCell}>
                <View style={styles.rowTitleWrap}>
                  <Ionicons name="cash-outline" size={16} color={colors.primaryBlue} />
                  <Text style={styles.attributeTitle}>Annual Premium</Text>
                </View>
                <Text style={styles.attributeSub}>Base indicative quote</Text>
              </View>
              {displayPlans.map((plan) => (
                <View key={plan.id} style={styles.attributeValueCell}>
                  <Text style={styles.highlightValue}>{formatCurrency(plan.basePremium)}</Text>
                  <Text style={styles.attributeSub}>+ 18% GST</Text>
                </View>
              ))}
              {displayPlans.length < 4 && <View style={styles.emptySlotCell} />}
            </View>

            {/* Row: Base Sum Insured */}
            <View style={styles.comparisonRow}>
              <View style={styles.attributeLabelCell}>
                <View style={styles.rowTitleWrap}>
                  <MaterialCommunityIcons name="shield-check-outline" size={16} color={colors.primaryNavy} />
                  <Text style={styles.attributeTitle}>Sum Insured</Text>
                </View>
                <Text style={styles.attributeSub}>Maximum annual cover</Text>
              </View>
              {displayPlans.map((plan) => (
                <View key={plan.id} style={styles.attributeValueCell}>
                  <Text style={styles.valueStrong}>{formatCurrency(plan.baseSumInsured, true)}</Text>
                </View>
              ))}
              {displayPlans.length < 4 && <View style={styles.emptySlotCell} />}
            </View>

            {/* Row: Claim Settlement Ratio */}
            <View style={[styles.comparisonRow, styles.altRow]}>
              <View style={styles.attributeLabelCell}>
                <View style={styles.rowTitleWrap}>
                  <Ionicons name="ribbon-outline" size={16} color={colors.success} />
                  <Text style={styles.attributeTitle}>Claim Settlement</Text>
                </View>
                <Text style={styles.attributeSub}>Verified annual %</Text>
              </View>
              {displayPlans.map((plan) => (
                <View key={plan.id} style={styles.attributeValueCell}>
                  <Badge label={`${plan.claimSettlementRatio}% CSR`} variant="success" size="sm" />
                </View>
              ))}
              {displayPlans.length < 4 && <View style={styles.emptySlotCell} />}
            </View>

            {/* Row: Cashless Hospitals / Network */}
            <View style={styles.comparisonRow}>
              <View style={styles.attributeLabelCell}>
                <View style={styles.rowTitleWrap}>
                  <Ionicons name="business-outline" size={16} color={colors.primaryNavy} />
                  <Text style={styles.attributeTitle}>Cashless Network</Text>
                </View>
                <Text style={styles.attributeSub}>Network providers</Text>
              </View>
              {displayPlans.map((plan) => (
                <View key={plan.id} style={styles.attributeValueCell}>
                  <Text style={styles.valueMedium}>
                    {plan.cashlessHospitalsCount
                      ? `${plan.cashlessHospitalsCount.toLocaleString()}+ centers`
                      : 'Pan-India'}
                  </Text>
                </View>
              ))}
              {displayPlans.length < 4 && <View style={styles.emptySlotCell} />}
            </View>

            {/* Row: Room Rent Limit */}
            <View style={[styles.comparisonRow, styles.altRow]}>
              <View style={styles.attributeLabelCell}>
                <View style={styles.rowTitleWrap}>
                  <Ionicons name="bed-outline" size={16} color={colors.primaryNavy} />
                  <Text style={styles.attributeTitle}>Room Rent Limit</Text>
                </View>
                <Text style={styles.attributeSub}>Daily accommodation</Text>
              </View>
              {displayPlans.map((plan) => (
                <View key={plan.id} style={styles.attributeValueCell}>
                  <Text style={styles.valueMedium}>{plan.roomRentLimit}</Text>
                </View>
              ))}
              {displayPlans.length < 4 && <View style={styles.emptySlotCell} />}
            </View>

            {/* Row: Co-Payment */}
            <View style={styles.comparisonRow}>
              <View style={styles.attributeLabelCell}>
                <View style={styles.rowTitleWrap}>
                  <Ionicons name="wallet-outline" size={16} color={colors.primaryNavy} />
                  <Text style={styles.attributeTitle}>Co-Payment</Text>
                </View>
                <Text style={styles.attributeSub}>Your share in claim</Text>
              </View>
              {displayPlans.map((plan) => (
                <View key={plan.id} style={styles.attributeValueCell}>
                  <Text style={[styles.valueStrong, plan.copayPercentage === 0 ? styles.positiveText : null]}>
                    {plan.copayPercentage === 0 ? 'Zero Co-Pay (0%)' : `${plan.copayPercentage}% Co-Pay`}
                  </Text>
                </View>
              ))}
              {displayPlans.length < 4 && <View style={styles.emptySlotCell} />}
            </View>

            {/* Row: Restoration Benefit */}
            <View style={[styles.comparisonRow, styles.altRow]}>
              <View style={styles.attributeLabelCell}>
                <View style={styles.rowTitleWrap}>
                  <Ionicons name="reload-circle-outline" size={16} color={colors.primaryNavy} />
                  <Text style={styles.attributeTitle}>Restoration Benefit</Text>
                </View>
                <Text style={styles.attributeSub}>Auto-refill policy</Text>
              </View>
              {displayPlans.map((plan) => (
                <View key={plan.id} style={styles.attributeValueCell}>
                  <Text style={styles.valueSmall}>{plan.restorationBenefit}</Text>
                </View>
              ))}
              {displayPlans.length < 4 && <View style={styles.emptySlotCell} />}
            </View>

            {/* Row: PED Waiting Period */}
            <View style={styles.comparisonRow}>
              <View style={styles.attributeLabelCell}>
                <View style={styles.rowTitleWrap}>
                  <Ionicons name="time-outline" size={16} color={colors.primaryNavy} />
                  <Text style={styles.attributeTitle}>PED Waiting Period</Text>
                </View>
                <Text style={styles.attributeSub}>Pre-existing diseases</Text>
              </View>
              {displayPlans.map((plan) => (
                <View key={plan.id} style={styles.attributeValueCell}>
                  <Text style={styles.valueMedium}>
                    {formatWaitingPeriod(plan.waitingPeriodPreExistingMonths)}
                  </Text>
                </View>
              ))}
              {displayPlans.length < 4 && <View style={styles.emptySlotCell} />}
            </View>

            {/* Row: Day Care Procedures */}
            <View style={[styles.comparisonRow, styles.altRow]}>
              <View style={styles.attributeLabelCell}>
                <View style={styles.rowTitleWrap}>
                  <Ionicons name="medkit-outline" size={16} color={colors.primaryNavy} />
                  <Text style={styles.attributeTitle}>Day Care Procedures</Text>
                </View>
                <Text style={styles.attributeSub}>&lt; 24h hospitalizations</Text>
              </View>
              {displayPlans.map((plan) => (
                <View key={plan.id} style={styles.attributeValueCell}>
                  <Text style={styles.valueMedium}>
                    {plan.dayCareProceduresCount > 0 ? `${plan.dayCareProceduresCount}+ procedures` : 'Included'}
                  </Text>
                </View>
              ))}
              {displayPlans.length < 4 && <View style={styles.emptySlotCell} />}
            </View>

            {/* Row: Maternity Cover */}
            <View style={styles.comparisonRow}>
              <View style={styles.attributeLabelCell}>
                <View style={styles.rowTitleWrap}>
                  <Ionicons name="heart-outline" size={16} color={colors.primaryNavy} />
                  <Text style={styles.attributeTitle}>Maternity Cover</Text>
                </View>
                <Text style={styles.attributeSub}>Delivery expenses</Text>
              </View>
              {displayPlans.map((plan) => (
                <View key={plan.id} style={styles.attributeValueCell}>
                  <View style={styles.maternityBadgeWrap}>
                    <Ionicons
                      name={plan.maternityCover ? 'checkmark-circle' : 'close-circle'}
                      size={20}
                      color={plan.maternityCover ? colors.success : colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.maternityText,
                        { color: plan.maternityCover ? colors.success : colors.textMuted },
                      ]}
                    >
                      {plan.maternityCover ? 'Covered' : 'Not Covered'}
                    </Text>
                  </View>
                </View>
              ))}
              {displayPlans.length < 4 && <View style={styles.emptySlotCell} />}
            </View>

            {/* Bottom Row: View Details Link */}
            <View style={[styles.comparisonRow, styles.altRow]}>
              <View style={styles.attributeLabelCell}>
                <Text style={styles.attributeTitle}>Full Policy Terms</Text>
                <Text style={styles.attributeSub}>Brochures & clauses</Text>
              </View>
              {displayPlans.map((plan) => (
                <View key={plan.id} style={styles.attributeValueCell}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('PlanDetails', { planId: plan.id })}
                    style={styles.viewDetailsBtn}
                  >
                    <Text style={styles.viewDetailsText}>View Plan</Text>
                    <Ionicons name="arrow-forward" size={14} color={colors.primaryBlue} />
                  </TouchableOpacity>
                </View>
              ))}
              {displayPlans.length < 4 && <View style={styles.emptySlotCell} />}
            </View>
          </View>
        </ScrollView>
      )}

      {/* Plan Selection Modal */}
      <Modal
        visible={showPickerModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPickerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select Plans to Compare</Text>
                <Text style={styles.modalSubtitle}>
                  Choose up to 4 {categoryName} plans ({displayPlans.length}/4 selected)
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowPickerModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={24} color={colors.primaryNavy} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={availableCategoryPlans}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.modalList}
              renderItem={({ item }) => {
                const isSelected = displayPlans.some((p) => p.id === item.id);
                return (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => handleTogglePlanInCompare(item)}
                    style={[styles.modalPlanCard, isSelected && styles.modalPlanCardSelected]}
                  >
                    <View style={styles.modalPlanLeft}>
                      <Text style={styles.modalPlanProvider}>{item.providerName}</Text>
                      <Text style={styles.modalPlanName}>{item.name}</Text>
                      <View style={styles.modalPlanHighlights}>
                        <Text style={styles.modalPlanCover}>
                          Cover: <Text style={{ fontWeight: '700' }}>{formatCurrency(item.baseSumInsured, true)}</Text>
                        </Text>
                        <Text style={styles.modalPlanDot}>•</Text>
                        <Text style={styles.modalPlanPremium}>
                          {formatCurrency(item.basePremium)}/yr
                        </Text>
                        <Text style={styles.modalPlanDot}>•</Text>
                        <Text style={styles.modalPlanCsr}>{item.claimSettlementRatio}% CSR</Text>
                      </View>
                    </View>

                    <View style={[styles.selectStatusBox, isSelected && styles.selectStatusBoxActive]}>
                      <Ionicons
                        name={isSelected ? 'checkmark-circle' : 'add-circle-outline'}
                        size={24}
                        color={isSelected ? colors.success : colors.primaryBlue}
                      />
                      <Text style={[styles.selectStatusText, isSelected && styles.selectStatusTextActive]}>
                        {isSelected ? 'Selected' : 'Add'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />

            <View style={styles.modalFooter}>
              <Button
                title="Done"
                variant="primary"
                size="md"
                onPress={() => setShowPickerModal(false)}
                style={{ width: '100%' }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
  },
  categoryPillsContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingVertical: spacing.xs,
  },
  categoryPillsList: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  catPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catPillActive: {
    backgroundColor: colors.primaryBlue,
    borderColor: colors.primaryBlue,
  },
  catPillText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  catPillTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  horizontalScroll: {
    padding: spacing.md,
  },
  tableContainer: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  comparisonRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  altRow: {
    backgroundColor: '#FAFCFF',
  },
  attributeLabelCell: {
    width: 160,
    padding: spacing.sm,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.borderLight,
    backgroundColor: '#F9FBFE',
  },
  rowTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionHeaderLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  selectPlanPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs + 2,
    paddingVertical: 4,
  },
  selectPlanPickerBtnText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryBlue,
  },
  attributeTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.primaryNavy,
  },
  attributeSub: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerLabelCell: {
    height: 165,
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  planHeaderCell: {
    width: 180,
    height: 165,
    padding: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRightWidth: 1,
    borderRightColor: colors.borderLight,
    position: 'relative',
    backgroundColor: colors.white,
  },
  planHeaderTopContent: {
    width: '100%',
    alignItems: 'center',
  },
  removePlanBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 2,
    padding: 2,
  },
  planProviderName: {
    ...typography.caption,
    fontSize: 11,
    color: colors.primaryBlue,
    fontWeight: '700',
    textAlign: 'center',
    alignSelf: 'center',
    height: 18,
  },
  planTitleName: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primaryNavy,
    textAlign: 'center',
    alignSelf: 'center',
    marginTop: 2,
    height: 44,
    lineHeight: 20,
    paddingHorizontal: 4,
  },
  planHeaderApplyBtnWrap: {
    width: '100%',
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planHeaderApplyBtn: {
    width: '100%',
  },
  addPlanSlotCard: {
    width: 180,
    height: 165,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primaryBlue,
    borderStyle: 'dashed',
    borderRadius: radii.md,
    backgroundColor: colors.lightBlueBg,
  },
  addIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  addPlanSlotTitle: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.primaryBlue,
    textAlign: 'center',
  },
  addPlanSlotSub: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  emptySlotCell: {
    width: 180,
    borderRightWidth: 1,
    borderRightColor: colors.borderLight,
    backgroundColor: '#FAFBFD',
  },
  attributeValueCell: {
    width: 180,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    borderRightWidth: 1,
    borderRightColor: colors.borderLight,
  },
  highlightValue: {
    ...typography.h3,
    color: colors.primaryBlue,
    textAlign: 'center',
    alignSelf: 'center',
  },
  valueStrong: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primaryNavy,
    textAlign: 'center',
    alignSelf: 'center',
  },
  positiveText: {
    color: colors.success,
  },
  valueMedium: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    textAlign: 'center',
    alignSelf: 'center',
  },
  valueSmall: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    alignSelf: 'center',
    lineHeight: 15,
  },
  maternityBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: 4,
  },
  maternityText: {
    ...typography.caption,
    fontWeight: '600',
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  viewDetailsText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryBlue,
  },
  emptyContainer: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.lightBlueBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.primaryNavy,
    textAlign: 'center',
  },
  emptyDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  emptyActionBtn: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  quickSelectHeader: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primaryNavy,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  quickSelectList: {
    width: '100%',
  },
  quickPlanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.sm + 2,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.xs,
  },
  quickPlanRowSelected: {
    borderColor: colors.primaryBlue,
    backgroundColor: '#F0F7FF',
  },
  quickPlanProvider: {
    ...typography.caption,
    color: colors.primaryBlue,
    fontWeight: '700',
    fontSize: 11,
  },
  quickPlanName: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.primaryNavy,
  },
  quickPlanPrice: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  quickAddBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.primaryBlue,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  quickAddBadgeSelected: {
    backgroundColor: colors.success,
  },
  quickAddText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(16, 43, 92, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.cardLg,
    borderTopRightRadius: radii.cardLg,
    maxHeight: '80%',
    paddingTop: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.primaryNavy,
  },
  modalSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: spacing.xs,
  },
  modalList: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  modalPlanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
  },
  modalPlanCardSelected: {
    borderColor: colors.success,
    backgroundColor: '#F3FAF6',
  },
  modalPlanLeft: {
    flex: 1,
  },
  modalPlanProvider: {
    ...typography.caption,
    color: colors.primaryBlue,
    fontWeight: '700',
  },
  modalPlanName: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primaryNavy,
    marginTop: 1,
  },
  modalPlanHighlights: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  modalPlanCover: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  modalPlanDot: {
    marginHorizontal: 4,
    color: colors.textMuted,
  },
  modalPlanPremium: {
    ...typography.caption,
    color: colors.primaryBlue,
    fontWeight: '700',
    fontSize: 11,
  },
  modalPlanCsr: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
    fontSize: 11,
  },
  selectStatusBox: {
    alignItems: 'center',
    paddingLeft: spacing.sm,
  },
  selectStatusBoxActive: {},
  selectStatusText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryBlue,
    marginTop: 2,
  },
  selectStatusTextActive: {
    color: colors.success,
  },
  modalFooter: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
});
