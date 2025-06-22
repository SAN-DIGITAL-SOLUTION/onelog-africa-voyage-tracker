
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

export function useRealtimeMissions(user: any) {
  const queryClient = useQueryClient();
  const [realtimeUpdates, setRealtimeUpdates] = useState<Mission[]>([]);

  useEffect(() => {
    if (!user) return;
    let missionsChannel: any = null;
    let statusHistoryChannel: any = null;
    try {
      console.log("Configuration de l'écoute temps réel pour les missions...");
      // Écouter les mises à jour de missions en temps réel
      missionsChannel = supabase
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
            queryClient.invalidateQueries({ queryKey: ["missions"] });
            queryClient.invalidateQueries({ queryKey: ["missions-detail", updatedMission.id] });
            setRealtimeUpdates(prev => {
              const filtered = prev.filter(m => m.id !== updatedMission.id);
              return [updatedMission, ...filtered].slice(0, 10);
            });
          }
        )
        .subscribe();

      // Écouter les changements d'historique de statut
      statusHistoryChannel = supabase
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
            queryClient.invalidateQueries({ queryKey: ["mission-status-history"] });
          }
        )
        .subscribe();
    } catch (err) {
      console.error("Erreur dans useRealtimeMissions:", err);
    }
    return () => {
      if (missionsChannel) supabase.removeChannel(missionsChannel);
      if (statusHistoryChannel) supabase.removeChannel(statusHistoryChannel);
    };
  }, [user, queryClient]);

  return {
    realtimeUpdates,
    clearUpdates: () => setRealtimeUpdates([])
  };
}
