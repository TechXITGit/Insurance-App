import { z } from 'zod';

export const phoneRegex = /^[6-9]\d{9}$/;
export const pincodeRegex = /^\d{6}$/;
export const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Please enter your mobile number or email')
    .refine(
      (val) => phoneRegex.test(val) || z.string().email().safeParse(val).success,
      'Enter a valid 10-digit Indian mobile number or email'
    ),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const createAccountSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().regex(phoneRegex, 'Enter a valid 10-digit Indian mobile number'),
  email: z.string().email('Enter a valid email address'),
  termsConsent: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the Terms & Privacy Policy',
  }),
});

export type CreateAccountFormData = z.infer<typeof createAccountSchema>;

export const otpSchema = z.object({
  otp: z.string().length(6, 'Please enter 6-digit OTP code'),
});

export type OtpFormData = z.infer<typeof otpSchema>;

export const applicantDetailsSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().regex(phoneRegex, 'Valid 10-digit phone number is required'),
  dob: z.string().min(1, 'Date of birth is required (YYYY-MM-DD)'),
  gender: z.enum(['male', 'female', 'other']),
  pincode: z.string().regex(pincodeRegex, 'Valid 6-digit PIN code is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  addressLine1: z.string().min(5, 'Address line is required'),
  panNumber: z.string().regex(panRegex, 'Valid PAN format required (e.g. ABCDE1234F)').optional().or(z.literal('')),
});

export type ApplicantDetailsFormData = z.infer<typeof applicantDetailsSchema>;

export const renewalFormSchema = z.object({
  categoryId: z.string().min(1, 'Please select insurance category'),
  insurerName: z.string().min(2, 'Please select your current insurer'),
  policyNumber: z.string().min(4, 'Enter a valid policy number'),
  applicantName: z.string().min(2, 'Enter policyholder name as per policy'),
  registeredPhone: z.string().regex(phoneRegex, 'Enter registered 10-digit phone number'),
});

export type RenewalFormData = z.infer<typeof renewalFormSchema>;

export const portabilityFormSchema = z.object({
  currentInsurer: z.string().min(2, 'Select your current insurer'),
  policyType: z.string().min(1, 'Select policy type'),
  currentPolicyNumber: z.string().min(4, 'Enter current policy number'),
  currentSumInsured: z.number().min(100000, 'Sum insured must be at least ₹1,00,000'),
  expiryDate: z.string().min(1, 'Expiry date is required (YYYY-MM-DD)'),
  targetInsurer: z.string().min(2, 'Select your preferred new insurer'),
  requestedSumInsured: z.number().min(100000, 'Requested sum insured is required'),
  insuredMembersCount: z.number().min(1, 'At least 1 member must be ported'),
  claimsInPast3Years: z.boolean(),
  claimDetails: z.string().optional(),
  applicantName: z.string().min(2, 'Applicant name is required'),
  applicantPhone: z.string().regex(phoneRegex, 'Valid phone number is required'),
  applicantEmail: z.string().email('Valid email is required'),
});

export type PortabilityFormData = z.infer<typeof portabilityFormSchema>;

export const groupInquirySchema = z.object({
  organizationName: z.string().min(2, 'Organization name is required'),
  organizationType: z.enum(['corporate', 'startup', 'ngo', 'association', 'educational']),
  memberCount: z.number().min(5, 'Group size must be at least 5 members'),
  category: z.string().min(2, 'Insurance category is required'),
  contactPerson: z.string().min(2, 'Contact person name is required'),
  businessEmail: z.string().email('Business email is required'),
  contactNumber: z.string().regex(phoneRegex, '10-digit contact number is required'),
  city: z.string().min(2, 'City is required'),
  additionalNotes: z.string().optional(),
});

export type GroupInquiryFormData = z.infer<typeof groupInquirySchema>;

export const corporateInquirySchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  employeeCount: z.number().min(10, 'Employee count must be at least 10'),
  coverageTypes: z.array(z.string()).min(1, 'Select at least one coverage type'),
  contactName: z.string().min(2, 'Contact name is required'),
  contactEmail: z.string().email('Official email address is required'),
  contactPhone: z.string().regex(phoneRegex, 'Valid 10-digit phone number is required'),
  requirementsSummary: z.string().optional(),
});

export type CorporateInquiryFormData = z.infer<typeof corporateInquirySchema>;
