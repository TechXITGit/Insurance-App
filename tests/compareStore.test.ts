import assert from 'node:assert';
import test from 'node:test';
import { useCompareStore } from '../src/store/compareStore';

test('Compare Store enforces category compatibility and max 4 plans limit', () => {
  // Reset store
  useCompareStore.getState().clearCompare();
  assert.strictEqual(useCompareStore.getState().selectedPlanIds.length, 0);
  assert.strictEqual(useCompareStore.getState().activeCategoryId, null);

  // 1. Add first health plan
  const res1 = useCompareStore.getState().addPlan('care-supreme', 'health');
  assert.strictEqual(res1.success, true);
  assert.strictEqual(useCompareStore.getState().selectedPlanIds.length, 1);
  assert.strictEqual(useCompareStore.getState().activeCategoryId, 'health');

  // 2. Reject incompatible category (e.g., term assurance vs health)
  const resIncompatible = useCompareStore.getState().addPlan('max-life-term', 'term_assurance');
  assert.strictEqual(resIncompatible.success, false);
  assert.ok(resIncompatible.message?.includes('same insurance category'));
  assert.strictEqual(useCompareStore.getState().selectedPlanIds.length, 1);

  // 3. Add more health plans up to 4
  const res2 = useCompareStore.getState().addPlan('hdfc-optima-secure', 'health');
  assert.strictEqual(res2.success, true);
  const res3 = useCompareStore.getState().addPlan('star-comprehensive', 'health');
  assert.strictEqual(res3.success, true);
  const res4 = useCompareStore.getState().addPlan('niva-bupa-reassure', 'health');
  assert.strictEqual(res4.success, true);
  assert.strictEqual(useCompareStore.getState().selectedPlanIds.length, 4);

  // 4. Reject 5th plan (exceeds max 4)
  const res5 = useCompareStore.getState().addPlan('extra-health-plan', 'health');
  assert.strictEqual(res5.success, false);
  assert.ok(res5.message?.includes('up to 4 plans'));
  assert.strictEqual(useCompareStore.getState().selectedPlanIds.length, 4);

  // 5. Duplicate addition
  const resDup = useCompareStore.getState().addPlan('care-supreme', 'health');
  assert.strictEqual(resDup.success, false);

  // 6. Remove plan
  useCompareStore.getState().removePlan('care-supreme');
  assert.strictEqual(useCompareStore.getState().selectedPlanIds.length, 3);
  assert.strictEqual(useCompareStore.getState().isInCompare('care-supreme'), false);
  assert.strictEqual(useCompareStore.getState().isInCompare('hdfc-optima-secure'), true);

  // 7. Clear all
  useCompareStore.getState().clearCompare();
  assert.strictEqual(useCompareStore.getState().selectedPlanIds.length, 0);
  assert.strictEqual(useCompareStore.getState().activeCategoryId, null);
});
