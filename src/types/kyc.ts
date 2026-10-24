export type KycStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export type KycDocumentType = 'pan_card' | 'aadhaar' | 'passport' | 'voter_id';

export interface KycDocument {
  type: KycDocumentType;
  name: string;
  documentNumber: string;
  uploadedAt: string;
}

export interface KycData {
  fullName: string;
  panNumber: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  status: KycStatus;
  verifiedAt?: string;
  ckycNumber?: string;
  documents: KycDocument[];
}
