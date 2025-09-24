import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface Mission {
  id: string;
  reference: string;
  status: string;
  priority: string;
  client_id: string;
  client_name: string;
  driver_id?: string;
  vehicle_id?: string;
  vehicle_plate?: string;
  pickup_location: string;
  delivery_location: string;
  pickup_date: string;
  delivery_date?: string;
  created_at: string;
  updated_at: string;
}

export function useMissions() {
  return useQuery({
    queryKey: ["missions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("missions")
        .select(`
          *,
          vehicles(plate_number),
          profiles!missions_client_id_fkey(full_name)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw new Error(error.message);
      
      // Transform data to match expected format
      return (data || []).map(mission => ({
        ...mission,
        client_name: mission.profiles?.full_name || mission.client_name || 'Client inconnu',
        vehicle_plate: mission.vehicles?.plate_number || mission.vehicle_plate || 'Véhicule non assigné'
      })) as Mission[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
}

// Hook with real-time updates
export function useRealtimeMissions() {
  const query = useQuery({
    queryKey: ["missions-realtime"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("missions")
        .select(`
          *,
          vehicles(plate_number),
          profiles!missions_client_id_fkey(full_name)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw new Error(error.message);
      
      return (data || []).map(mission => ({
        ...mission,
        client_name: mission.profiles?.full_name || mission.client_name || 'Client inconnu',
        vehicle_plate: mission.vehicles?.plate_number || mission.vehicle_plate || 'Véhicule non assigné'
      })) as Mission[];
    },
    refetchInterval: 10000, // More frequent updates for real-time
    staleTime: 5000,
  });

  // Set up real-time subscription
  React.useEffect(() => {
    const channel = supabase
      .channel('missions-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'missions' },
        () => query.refetch()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [query.refetch]);

  return query;
}

export default useMissions;
