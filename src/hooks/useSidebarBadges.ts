import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase';
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";

/**
 * Fournit les compteurs dynamiques pour la sidebar :
 * - missions en cours (par rôle)
 * - notifications non lues
 * - demandes admin en attente
 */
export function useSidebarBadges() {
  const { user } = useAuth();
  const { role } = useRole();
  const [missionCount, setMissionCount] = useState<number | null>(null);
  const [notifCount, setNotifCount] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    
    // 2. Missions en cours
    let missionQuery;
    if (role === "client") {
      missionQuery = supabase
        .from("missions")
        .select("*", { count: "exact" })
        .eq("client", user.id)
        .in("status", ["en_cours", "assignée", "à_livrer"]);
    } else if (role === "chauffeur") {
      missionQuery = supabase
        .from("missions")
        .select("*", { count: "exact" })
        .eq("chauffeur", user.id)
        .in("status", ["en_cours", "assignée", "à_livrer"]);
    } else {
      missionQuery = supabase
        .from("missions")
        .select("*", { count: "exact" })
        .in("status", ["en_cours", "assignée", "à_livrer"]);
    }
    missionQuery.then(({ count }) => setMissionCount(count ?? 0));
    // 3. Notifications non lues
    supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .eq("is_read", false)
      .then(({ count }) => setNotifCount(count ?? 0));
    // 4. Demandes admin en attente
    if (role === "admin") {
      supabase
        .from("role_requests")
        .select("*", { count: "exact" })
        .eq("status", "pending")
        .then(({ count }) => setPendingCount(count ?? 0));
    }
  }, [user, role]);

  return { missionCount, notifCount, pendingCount, role };
}
