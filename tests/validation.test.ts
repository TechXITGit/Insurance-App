import assert from 'node:assert';
import test from 'node:test';
import {
  phoneRegex,
  pincodeRegex,
  panRegex,
  loginSchema,
  createAccountSchema,
} from '../src/utils/validation';

test('Phone regex accepts valid 10-digit Indian numbers', () => {
  assert.strictEqual(phoneRegex.test('9876543210'), true);
  assert.strictEqual(phoneRegex.test('7001234567'), true);
  assert.strictEqual(phoneRegex.test('6200112233'), true);
  assert.strictEqual(phoneRegex.test('5551234567'), false); // Doesn't start with 6-9
  assert.strictEqual(phoneRegex.test('987654321'), false); // 9 digits
  assert.strictEqual(phoneRegex.test('98765432100'), false); // 11 digits
});

test('Pincode regex validates 6-digit postal codes', () => {
  assert.strictEqual(pincodeRegex.test('110001'), true);
  assert.strictEqual(pincodeRegex.test('400001'), true);
  assert.strictEqual(pincodeRegex.test('11000'), false);
  assert.strictEqual(pincodeRegex.test('1100011'), false);
});

test('PAN card regex validates Indian Income Tax PAN format', () => {
  assert.strictEqual(panRegex.test('ABCDE1234F'), true);
  assert.strictEqual(panRegex.test('BLZPY9876A'), true);
  assert.strictEqual(panRegex.test('12345ABCDE'), false);
});

test('Login schema validates mobile or email format', () => {
  assert.strictEqual(loginSchema.safeParse({ identifier: '9876543210' }).success, true);
  assert.strictEqual(loginSchema.safeParse({ identifier: 'user@example.com' }).success, true);
  assert.strictEqual(loginSchema.safeParse({ identifier: 'not-valid' }).success, false);
});

test('Create Account schema enforces consent and valid data', () => {
  const valid = createAccountSchema.safeParse({
    fullName: 'Rahul Sharma',
    phone: '9876543210',
    email: 'rahul@example.com',
    termsConsent: true,
  });
  assert.strictEqual(valid.success, true);

  const missingConsent = createAccountSchema.safeParse({
    fullName: 'Rahul Sharma',
    phone: '9876543210',
    email: 'rahul@example.com',
    termsConsent: false,
  });
  assert.strictEqual(missingConsent.success, false);
});
