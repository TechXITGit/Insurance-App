import { CategoryId } from './insurance';

export interface AuthenticatedUser {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  avatarUrl?: string;
  isKycVerified: boolean;
  city?: string;
  pincode?: string;
  createdAt: string;
}

export type ProtectedActionType =
  | 'APPLY'
  | 'RENEW'
  | 'PORT'
  | 'SAVE_PLAN'
  | 'MY_POLICIES'
  | 'PROFILE_EDIT'
  | 'SUBMIT_INQUIRY';

export interface PendingAction {
  type: ProtectedActionType;
  planId?: string;
  categoryId?: CategoryId;
  draftData?: any;
  targetScreen?: string;
  targetParams?: Record<string, any>;
  timestamp: number;
}

export interface AuthState {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  pendingAction: PendingAction | null;
}
