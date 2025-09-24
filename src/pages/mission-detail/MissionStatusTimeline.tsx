import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Clock, Truck, User, Package } from "lucide-react";
import { supabase } from '@/lib/supabase';

const STATUS_STEPS = [
  { key: "Créée", label: "Créée", icon: Clock },
  { key: "Assignée", label: "Assignée", icon: User },
  { key: "En cours", label: "En cours", icon: Truck },
  { key: "En livraison", label: "En livraison", icon: Package },
  { key: "Terminée", label: "Terminée", icon: Check },
];

type StatusItem = {
  status: string;
  changed_at: string;
};

export default function MissionStatusTimeline({ missionId }: { missionId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["mission-status-history", missionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mission_status_history")
        .select("status, changed_at")
        .eq("mission_id", missionId)
        .order("changed_at", { ascending: true });
      if (error) throw new Error(error.message);
      return (data as StatusItem[]) ?? [];
    },
    enabled: !!missionId,
  });

  // Map status to their first occurred date for display
  const statusDates: Record<string, string> = {};
  (data ?? []).forEach((item) => {
    if (!statusDates[item.status]) {
      statusDates[item.status] = new Date(item.changed_at).toLocaleString();
    }
  });

  // Figure out last completed step index
  let lastCompletedIdx = -1;
  STATUS_STEPS.forEach((step, idx) => {
    if (statusDates[step.key]) {
      lastCompletedIdx = idx;
    }
  });

  return (
    <section className="pt-4 animate-fade-in">
      <h3 className="font-semibold mb-3">Progression de la mission</h3>
      <div className="flex flex-col gap-0 relative">
        <div className="absolute left-6 top-8 bottom-2 w-1 bg-onelog-bleu/20 z-0 rounded" />
        {STATUS_STEPS.map((step, idx) => {
          const isDone = idx <= lastCompletedIdx;
          const isActive = idx === lastCompletedIdx + 1;
          const Icon = step.icon;

          return (
            <AnimatePresence key={step.key}>
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.11, type: "spring", stiffness: 120 }}
                className="flex items-center relative z-10"
              >
                <span
                  className={
                    `w-7 h-7 rounded-full border-2 flex items-center justify-center mr-4
                    ${isDone ? "bg-green-500 border-green-500 text-white shadow" :
                      isActive ? "bg-white border-onelog-bleu text-onelog-bleu animate-pulse-gps" :
                      "bg-gray-200 border-gray-300 text-gray-400"}`
                  }
                >
                  {isDone ? <Check size={19} /> : <Icon size={18} />}
                </span>
                <div className="flex flex-col">
                  <span className={`text-base font-semibold ${isDone ? "text-green-700" : isActive ? "text-onelog-bleu" : "text-gray-400"}`}>
                    {step.label}
                  </span>
                  <span className="text-xs text-gray-400">
                    {statusDates[step.key] || (isActive && "À venir...")}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          );
        })}
      </div>
      {isLoading && <div className="text-xs text-gray-400 mt-2">Chargement de la progression...</div>}
      {error && <div className="text-xs text-red-400 mt-2">Erreur lors du chargement</div>}
    </section>
  );
}
