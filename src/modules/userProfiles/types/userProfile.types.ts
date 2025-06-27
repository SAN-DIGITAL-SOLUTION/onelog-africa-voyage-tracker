export type UserRole = 'admin' | 'operator' | 'client';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  preferences?: Record<string, any>;
  created_at: string;
  updated_at: string;
}
