import assert from 'node:assert';
import test from 'node:test';
import { quoteService } from '../src/services/quoteService';

test('Quote Service calculates actuarial premiums and 18% GST accurately', async () => {
  // 1. Basic calculation for non-smoker aged 28, 10L sum insured for health
  const quotes = await quoteService.calculateIndicativeQuote({
    categoryId: 'health',
    age: 28,
    pincode: '110001',
    sumInsured: 1000000,
    tobaccoUser: false,
  });

  assert.ok(quotes.length > 0);
  const baseQuote = quotes[0];
  assert.ok(baseQuote.estimatedAnnualPremium > 0);
  assert.strictEqual(baseQuote.gstAmount, Math.round(baseQuote.estimatedAnnualPremium * 0.18));
  assert.strictEqual(baseQuote.totalAnnualPayable, baseQuote.estimatedAnnualPremium + baseQuote.gstAmount);
  assert.strictEqual(baseQuote.estimatedMonthlyPremium, Math.round(baseQuote.totalAnnualPayable / 12));
  assert.strictEqual(baseQuote.isIndicative, true);
  assert.ok(baseQuote.disclaimer.includes('Indicative estimate'));

  // 2. Tobacco loading check
  const tobaccoQuotes = await quoteService.calculateIndicativeQuote({
    categoryId: 'health',
    age: 28,
    pincode: '110001',
    sumInsured: 1000000,
    tobaccoUser: true,
  });

  const tobaccoQuote = tobaccoQuotes.find((q) => q.planId === baseQuote.planId);
  assert.ok(tobaccoQuote);
  // Tobacco user should have higher base premium
  assert.ok(tobaccoQuote.estimatedAnnualPremium > baseQuote.estimatedAnnualPremium);

  // 3. Age loading check (age 55 vs age 28)
  const seniorQuotes = await quoteService.calculateIndicativeQuote({
    categoryId: 'health',
    age: 55,
    pincode: '110001',
    sumInsured: 1000000,
    tobaccoUser: false,
  });

  const seniorQuote = seniorQuotes.find((q) => q.planId === baseQuote.planId);
  assert.ok(seniorQuote);
  assert.ok(seniorQuote.estimatedAnnualPremium > baseQuote.estimatedAnnualPremium);
});
