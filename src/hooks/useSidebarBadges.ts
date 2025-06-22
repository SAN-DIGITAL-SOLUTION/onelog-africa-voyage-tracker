import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";

/**
 * Fournit les compteurs dynamiques pour la sidebar :
 * - missions en cours (par rôle)
 * - notifications non lues
 * - demandes admin en attente
 */
export function useSidebarBadges() {
  const { user } = useAuth();
  const [missionCount, setMissionCount] = useState<number | null>(null);
  const [notifCount, setNotifCount] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    // 1. Récupérer le rôle utilisateur (depuis user_metadata)
    setRole(user.user_metadata?.role || null);
    // 2. Missions en cours
    let missionQuery;
    if (user.user_metadata?.role === "client") {
      missionQuery = supabase
        .from("missions")
        .select("id", { count: "exact", head: true })
        .eq("client", user.id)
        .in("status", ["en_cours", "assignée", "à_livrer"]);
    } else if (user.user_metadata?.role === "chauffeur") {
      missionQuery = supabase
        .from("missions")
        .select("id", { count: "exact", head: true })
        .eq("chauffeur", user.id)
        .in("status", ["en_cours", "assignée", "à_livrer"]);
    } else {
      missionQuery = supabase
        .from("missions")
        .select("id", { count: "exact", head: true })
        .in("status", ["en_cours", "assignée", "à_livrer"]);
    }
    missionQuery.then(({ count }) => setMissionCount(count ?? 0));
    // 3. Notifications non lues
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false)
      .then(({ count }) => setNotifCount(count ?? 0));
    // 4. Demandes admin en attente
    if (user.user_metadata?.role === "admin") {
      supabase
        .from("role_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending")
        .then(({ count }) => setPendingCount(count ?? 0));
    }
  }, [user]);

  return { missionCount, notifCount, pendingCount, role };
}
