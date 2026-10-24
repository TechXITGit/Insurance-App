import { InsuranceQuote, QuoteRequest } from '../types/insurance';
import { demoPlans } from '../data/demoPlans';

export const quoteService = {
  /**
   * Calculate indicative quotes based on age, category, and sum insured
   */
  async calculateIndicativeQuote(request: QuoteRequest): Promise<InsuranceQuote[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const eligiblePlans = demoPlans.filter((p) => p.categoryId === request.categoryId);
    const plansToQuote = eligiblePlans.length > 0 ? eligiblePlans : demoPlans.slice(0, 3);

    return plansToQuote.map((plan) => {
      // Actuarial factor approximations for indicative quote
      let ageFactor = 1.0;
      if (request.age < 25) ageFactor = 0.85;
      else if (request.age <= 35) ageFactor = 1.0;
      else if (request.age <= 45) ageFactor = 1.3;
      else if (request.age <= 55) ageFactor = 1.7;
      else ageFactor = 2.2;

      const tobaccoFactor = request.tobaccoUser ? 1.4 : 1.0;
      const sumFactor = request.sumInsured / plan.baseSumInsured;

      // Base calculated premium
      const baseEstimate = Math.round(plan.basePremium * ageFactor * tobaccoFactor * Math.sqrt(sumFactor));
      const gstAmount = Math.round(baseEstimate * 0.18); // 18% GST standard in India
      const totalAnnualPayable = baseEstimate + gstAmount;
      const estimatedMonthlyPremium = Math.round(totalAnnualPayable / 12);

      return {
        planId: plan.id,
        planName: plan.name,
        providerName: plan.providerName,
        estimatedAnnualPremium: baseEstimate,
        estimatedMonthlyPremium,
        gstAmount,
        totalAnnualPayable,
        sumInsured: request.sumInsured,
        isIndicative: true,
        disclaimer:
          'Indicative estimate based on age and sum insured. Final payable premium and tax deductions are subject to insurer medical underwriting and location rules.',
      };
    });
  },
};
