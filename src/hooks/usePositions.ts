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
  const { data: positions, refetch } = usePositions();

  useEffect(() => {
    const channel = supabase
      .channel('positions-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'positions' },
        () => refetch()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return positions;
}
