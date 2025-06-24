import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useUserProfile(id: string) {
  return useQuery(['userProfile', id], async () => {
    const { data, error, status } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (status === 403) throw new Error('Accès refusé');
    if (error) throw error;
    return data;
  });
}
