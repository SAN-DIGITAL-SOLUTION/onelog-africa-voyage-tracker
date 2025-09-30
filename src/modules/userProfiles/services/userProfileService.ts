import { supabase } from '../../../integrations/supabase/client';
import type { UserProfile, UserRole } from '../types/userProfile.types';

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data as UserProfile;
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .single();
  if (error) return null;
  return data as UserProfile;
};

export const listUserProfiles = async (): Promise<UserProfile[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('*');
  if (error) return [];
  return data as UserProfile[];
};

export const setUserRole = async (userId: string, role: UserRole): Promise<boolean> => {
  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId);
  return !error;
};
