import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from '@/lib/supabase';
import { toast } from "@/hooks/use-toast";

export const PAGE_SIZE = 10;
export const statusOptions = ["En cours", "Terminée", "Annulée"] as const;

export function useMissions() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterClient, setFilterClient] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [debounced, setDebounced] = useState(search);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(search), 400);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: missions, isLoading, error } = useQuery({
    queryKey: ["missions", debounced, filterClient, filterStatus],
    queryFn: async () => {
      let query = supabase.from("missions").select("*").order("date", { ascending: false });
      if (debounced)
        query = query.ilike("ref", `%${debounced}%`);
      if (filterClient)
        query = query.ilike("client", `%${filterClient}%`);
      if (filterStatus)
        query = query.eq("status", filterStatus);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  const missionsPage = Array.isArray(missions) ? missions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : [];
  const pageCount = Math.ceil((Array.isArray(missions) ? missions.length : 0) / PAGE_SIZE);

  // Pagination
  function goToPage(p: number) {
    setPage(Math.min(Math.max(1, p), pageCount === 0 ? 1 : pageCount));
  }

  return {
    missions: Array.isArray(missions) ? missions : [],
    missionsPage,
    isLoading,
    error,
    page,
    setPage: goToPage,
    search,
    setSearch,
    filterClient,
    setFilterClient,
    filterStatus,
    setFilterStatus,
    pageCount,
    debounced,
    refetchKey: ["missions", debounced, filterClient, filterStatus],
  };
}
