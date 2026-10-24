export interface FaqItem {
  id: string;
  category: 'general' | 'health' | 'term' | 'renewal' | 'portability' | 'claims';
  question: string;
  answer: string;
}

export const demoGeneralFaqs: FaqItem[] = [
  {
    id: 'f1',
    category: 'general',
    question: 'Can I browse plans and compare prices without creating an account?',
    answer: 'Yes! InsureEase believes in frictionless exploration. You can discover categories, browse catalog plans, compare up to 4 plans side-by-side, read policy wordings, and calculate indicative quotes completely without an account.',
  },
  {
    id: 'f2',
    category: 'general',
    question: 'When will I be asked to sign in or register?',
    answer: 'Authentication is only required when you perform a personal service, such as applying for a policy, saving a plan to your profile, renewing an existing policy, submitting a portability draft, or checking your private active policies.',
  },
  {
    id: 'f3',
    category: 'general',
    question: 'What happens to the plan I was viewing if I have to log in?',
    answer: 'Your selected plan, customization choices, and form progress are preserved automatically. As soon as you log in or complete OTP verification, you are directly resumed back to your application.',
  },
  {
    id: 'f4',
    category: 'health',
    question: 'How do network cashless claims work at hospitals?',
    answer: 'At network hospitals, show your digital health insurance e-card and photo ID at the hospital TPA or insurance helpdesk. The hospital sends a pre-authorization request to the insurer. Once approved, medical bills up to authorized limits are paid directly by the insurer upon discharge.',
  },
  {
    id: 'f5',
    category: 'renewal',
    question: 'What is the consequence of letting my policy lapse?',
    answer: 'If you do not renew within the 30-day statutory grace period, your policy lapses. You lose all accumulated No Claim Bonus (NCB) and continuity credits for pre-existing disease waiting periods, and you may need to undergo fresh medical tests.',
  },
  {
    id: 'f6',
    category: 'portability',
    question: 'How many days before renewal must I submit a portability request?',
    answer: 'Under IRDAI regulations, you must apply for health insurance portability to the new insurer at least 45 days prior to your current policy expiry date to allow proper medical underwriting and document verification.',
  },
  {
    id: 'f7',
    category: 'claims',
    question: 'What documents are required to file a reimbursement claim?',
    answer: 'For reimbursement claims, you need: 1) Completed claim form signed by the doctor, 2) Original discharge summary, 3) Itemized hospital bill with receipt, 4) Investigation/diagnostic reports with doctor prescriptions, and 5) KYC & cancelled cheque of the policyholder.',
  },
];
