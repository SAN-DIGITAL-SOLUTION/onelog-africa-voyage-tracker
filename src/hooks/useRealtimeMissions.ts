
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

type Mission = {
  id: string;
  ref: string;
  status: string;
  client: string;
  date: string;
  user_id: string;
};

export function useRealtimeMissions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [realtimeUpdates, setRealtimeUpdates] = useState<Mission[]>([]);

  useEffect(() => {
    if (!user) return;

    console.log("Configuration de l'écoute temps réel pour les missions...");

    // Écouter les mises à jour de missions en temps réel
    const missionsChannel = supabase
      .channel('missions-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'missions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Mission mise à jour:', payload);
          const updatedMission = payload.new as Mission;
          
          // Invalider et refetch les queries liées aux missions
          queryClient.invalidateQueries({ queryKey: ["missions"] });
          queryClient.invalidateQueries({ queryKey: ["missions-detail", updatedMission.id] });
          
          // Ajouter à la liste des mises à jour temps réel
          setRealtimeUpdates(prev => {
            const filtered = prev.filter(m => m.id !== updatedMission.id);
            return [updatedMission, ...filtered].slice(0, 10); // Garder max 10 mises à jour
          });
        }
      )
      .subscribe();

    // Écouter les changements d'historique de statut
    const statusHistoryChannel = supabase
      .channel('status-history-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mission_status_history'
        },
        (payload) => {
          console.log('Nouvel historique de statut:', payload);
          
          // Invalider les queries liées à l'historique de statut
          queryClient.invalidateQueries({ queryKey: ["mission-status-history"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(missionsChannel);
      supabase.removeChannel(statusHistoryChannel);
    };
  }, [user, queryClient]);

  return {
    realtimeUpdates,
    clearUpdates: () => setRealtimeUpdates([])
  };
}
