import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { demoPlans } from '../../data/demoPlans';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { Header } from '../../components/common/Header';
import { PlanCard } from '../../components/insurance/PlanCard';
import { EmptyState } from '../../components/common/EmptyState';
import { useSavedPlansStore } from '../../store/savedPlansStore';
import { useCompareStore } from '../../store/compareStore';
import { useAuthStore } from '../../store/authStore';
import { InsurancePlan } from '../../types/insurance';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SavedPlansScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { savedPlanIds, loadSavedPlans, toggleSavePlan, isSaved } = useSavedPlansStore();
  const { addPlan, isInCompare } = useCompareStore();
  const { isAuthenticated, setPendingAction } = useAuthStore();

  useEffect(() => {
    loadSavedPlans();
  }, []);

  const savedPlans = demoPlans.filter((p) => savedPlanIds.includes(p.id));

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

  const handleCompare = (plan: InsurancePlan) => {
    const res = addPlan(plan.id, plan.categoryId);
    if (!res.success && res.message) {
      Alert.alert('Compare Notice', res.message);
    } else {
      navigation.navigate('PlanComparison', { categoryId: plan.categoryId });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Saved Plans" subtitle={`${savedPlans.length} Bookmarked`} />

      <FlatList
        data={savedPlans}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <PlanCard
            plan={item}
            isInCompare={isInCompare(item.id)}
            isSaved={isSaved(item.id)}
            onPressDetails={() => navigation.navigate('PlanDetails', { planId: item.id })}
            onPressApply={() => handleApply(item)}
            onPressCompare={() => handleCompare(item)}
            onPressSave={() => toggleSavePlan(item.id)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            iconName="bookmark-outline"
            title="No Saved Plans Yet"
            description="Tap the bookmark icon on any plan card in Explore or Category screens to save plans for later."
            actionTitle="Explore Insurance"
            onActionPress={() =>
              navigation.navigate('MainTabs', {
                screen: 'ExploreTab',
              } as any)
            }
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
});
