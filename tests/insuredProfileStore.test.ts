import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { useInsuredProfileStore } from '../src/store/insuredProfileStore';

describe('Insured Profile Store', () => {
  beforeEach(async () => {
    await useInsuredProfileStore.getState().resetProfile();
  });

  test('initializes with clean default state', () => {
    const { profile, isProfileSubmitted } = useInsuredProfileStore.getState();
    assert.equal(isProfileSubmitted, false);
    assert.equal(profile.relation, 'self');
    assert.equal(profile.fullName, '');
    assert.equal(profile.hasPreExistingConditions, false);
    assert.equal(profile.insuranceType, 'health');
  });

  test('submits profile and updates fields correctly', async () => {
    const store = useInsuredProfileStore.getState();
    await store.submitProfile({
      relation: 'father',
      fullName: 'Rajesh Mehta',
      age: '62',
      gender: 'male',
      pincode: '110001',
      city: 'Delhi NCR',
      hasPreExistingConditions: true,
      preExistingDetails: 'Hypertension for 5 years',
      insuranceType: 'senior',
    });

    const updated = useInsuredProfileStore.getState();
    assert.equal(updated.isProfileSubmitted, true);
    assert.equal(updated.profile.relation, 'father');
    assert.equal(updated.profile.fullName, 'Rajesh Mehta');
    assert.equal(updated.profile.age, '62');
    assert.equal(updated.profile.hasPreExistingConditions, true);
    assert.equal(updated.profile.preExistingDetails, 'Hypertension for 5 years');
    assert.equal(updated.profile.insuranceType, 'senior');
  });

  test('resets profile back to defaults', async () => {
    const store = useInsuredProfileStore.getState();
    await store.submitProfile({
      relation: 'spouse',
      fullName: 'Pooja Mehta',
      age: '29',
    });

    assert.equal(useInsuredProfileStore.getState().isProfileSubmitted, true);

    await store.resetProfile();
    const resetState = useInsuredProfileStore.getState();
    assert.equal(resetState.isProfileSubmitted, false);
    assert.equal(resetState.profile.fullName, '');
    assert.equal(resetState.profile.relation, 'self');
  });
});
