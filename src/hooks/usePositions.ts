import { useQuery } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import { useEffect } from "react";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export interface Position {
  id: string;
  vehicle_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export function usePositions() {
  return useQuery({
    queryKey: ["positions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("positions")
        .select("id, vehicle_id, latitude, longitude, timestamp")
        .order("timestamp", { ascending: false })
        .limit(100);
      
      if (error) throw new Error(error.message);
      return data as Position[];
    },
    refetchInterval: 5000, // Rafraîchissement toutes les 5 secondes
    staleTime: 2000,
  });
}

// Hook avec Realtime pour mises à jour instantanées
export function useRealtimePositions() {
  const query = useQuery({
    queryKey: ["positions-realtime"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tracking_points")
        .select(`
          id,
          mission_id,
          latitude,
          longitude,
          speed,
          timestamp,
          missions(
            id,
            reference,
            status,
            vehicle_id,
            vehicles(plate_number)
          )
        `)
        .order("timestamp", { ascending: false })
        .limit(100);
      
      if (error) throw new Error(error.message);
      return data;
    },
    refetchInterval: 10000, // Rafraîchissement toutes les 10 secondes
    staleTime: 5000,
  });

  useEffect(() => {
    const channel = supabase
      .channel('tracking-points-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tracking_points' },
        () => query.refetch()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [query.refetch]);

  return query;
}
