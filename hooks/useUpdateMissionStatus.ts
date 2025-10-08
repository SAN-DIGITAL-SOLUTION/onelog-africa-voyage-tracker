import { useState } from 'react';
import { supabase } from '@/services/supabaseClient';
import { toast } from '@/components/ui/use-toast';

export function useUpdateMissionStatus() {
  const [loading, setLoading] = useState(false);

  const updateStatus = async (missionId: string, status: 'en_route' | 'livree' | 'probleme' | 'cloturee') => {
    setLoading(true);
    const { error } = await supabase
      .from('missions')
      .update({ status })
      .eq('id', missionId);

    setLoading(false);

    if (error) {
      toast({
        title: 'Erreur',
        description: `Impossible de mettre à jour le statut: ${error.message}`,
        variant: 'destructive',
      });
      return false;
    } else {
      toast({
        title: 'Succès',
        description: `Le statut de la mission a été mis à jour.`,
      });
      return true;
    }
  };

  return { updateStatus, loading };
}
