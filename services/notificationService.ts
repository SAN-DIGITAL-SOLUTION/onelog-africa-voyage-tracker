import { supabase } from "@/integrations/supabase/client";

export async function notifyChauffeur(chauffeurId: string, message: string) {
  // Exemple simple : insert dans une table notifications
  await supabase.from("notifications").insert([
    {
      user_id: chauffeurId,
      message,
      type: "mission_affectation",
      lu: false,
      created_at: new Date().toISOString(),
    },
  ]);
}
