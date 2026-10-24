export interface GlossaryTerm {
  term: string;
  category: 'Health' | 'Life' | 'General' | 'Claims';
  definition: string;
  example?: string;
}

export const demoGlossaryTerms: GlossaryTerm[] = [
  {
    term: 'Cashless Hospitalization',
    category: 'Claims',
    definition: 'A claim settlement facility where the insurer or TPA pays the hospital bills directly for approved treatments, so the insured does not have to pay out of pocket upfront.',
    example: 'Admitted at a network hospital with your digital health card; TPA pre-authorizes ₹1.2 Lakh directly.',
  },
  {
    term: 'Sum Insured / Sum Assured',
    category: 'General',
    definition: 'The maximum financial liability guaranteed by the insurer during the policy year. In health insurance, it is the annual medical expense limit (Sum Insured); in life insurance, it is the nominee payout (Sum Assured).',
    example: 'A ₹10 Lakh health cover pays medical bills up to ₹10 Lakh in a single year.',
  },
  {
    term: 'No Claim Bonus (NCB)',
    category: 'Health',
    definition: 'A reward given to policyholders for not filing any claim in a policy year. Usually provided as an increase in the Sum Insured (Cumulative Bonus) without an increase in premium.',
    example: 'Care Supreme increases base ₹10L cover by 50% each claim-free year up to ₹50L.',
  },
  {
    term: 'Pre-Existing Disease (PED)',
    category: 'Health',
    definition: 'Any ailment, condition, or injury diagnosed or treated prior to buying the insurance policy. IRDAI allows insurers a waiting period of up to 36 months before covering PED claims.',
    example: 'Diabetes diagnosed 2 years prior to buying policy is covered after the PED waiting period.',
  },
  {
    term: 'Room Rent Capping',
    category: 'Health',
    definition: 'A restriction limiting the daily hospital room charge payable by the insurer. Choosing a room above this cap triggers proportionate deductions on all doctor, ICU, and surgical fees.',
    example: 'If cap is 1% (₹5,000/day) on ₹5L cover and you take a ₹8,000/day room, proportionate deductions apply.',
  },
  {
    term: 'Co-Payment (Co-Pay)',
    category: 'Health',
    definition: 'A cost-sharing agreement where the insured agrees to pay a fixed percentage of each approved medical claim, while the insurer pays the remaining balance.',
    example: 'With a 10% co-pay on a ₹1,00,000 bill, you pay ₹10,000 and the insurer pays ₹90,000.',
  },
  {
    term: 'Restoration Benefit',
    category: 'Health',
    definition: 'An automated feature that restores 100% of your exhausted Sum Insured if it is consumed by claims during the current policy year.',
    example: 'If ₹5L is spent on surgery, the cover automatically resets to ₹5L for subsequent hospitalizations.',
  },
  {
    term: 'Portability',
    category: 'Health',
    definition: 'The legal right granted by IRDAI allowing a policyholder to transfer their health insurance policy from one insurer to another while retaining continuity benefits and waiting-period credits.',
    example: 'Switching after 3 years from Insurer A to Insurer B without serving new 3-year PED waiting periods.',
  },
  {
    term: 'Grace Period',
    category: 'General',
    definition: 'A statutory period of 30 days granted after the policy expiry date to pay the renewal premium without losing continuity of coverage and accrued bonuses.',
    example: 'Policy expiring on Oct 20 can be renewed until Nov 19 with full continuity retained.',
  },
  {
    term: 'Free-Look Period',
    category: 'General',
    definition: 'A mandatory window of 15 to 30 days from policy receipt during which the policyholder can review policy terms and cancel for a full refund (minus stamp duty/medical charges) if unsatisfied.',
    example: 'Canceling a term plan within 15 days of receiving the bond for an immediate refund.',
  },
  {
    term: 'Deductible',
    category: 'Health',
    definition: 'A predetermined amount the insured must pay towards medical claims in a year before the insurance company starts reimbursing expenses.',
    example: 'With a ₹50,000 deductible, claims up to ₹50,000 are self-funded; any amount above ₹50,000 is paid by insurer.',
  },
  {
    term: 'Claim Settlement Ratio (CSR)',
    category: 'General',
    definition: 'The percentage of total claims received that an insurer settles within a financial year. Higher CSR (above 95%) indicates strong claim approval consistency.',
    example: 'An insurer receiving 10,000 claims and settling 9,850 claims has a CSR of 98.5%.',
  },
];
