
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Edit } from "lucide-react";

export default function MissionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: mission, isLoading, error } = useQuery({
    queryKey: ["missions-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("missions").select("*").eq("id", id).single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) return (
    <main className="container mx-auto flex items-center justify-center h-64">
      <span className="animate-spin h-7 w-7 border-4 border-onelog-bleu border-t-transparent rounded-full inline-block" />
    </main>
  );

  if (error) return (
    <main className="container mx-auto text-center mt-24">
      <h2 className="text-xl text-red-600 mb-4">Erreur lors du chargement</h2>
      <Button variant="outline" onClick={() => navigate("/missions")}>
        Retour
      </Button>
    </main>
  );

  if (!mission) return (
    <main className="container mx-auto text-center mt-24">
      <h2 className="text-xl text-onelog-nuit/60">Mission introuvable</h2>
      <Button variant="outline" onClick={() => navigate("/missions")}>
        Retour
      </Button>
    </main>
  );

  return (
    <main className="container mx-auto max-w-2xl pt-8">
      <Button variant="ghost" className="mb-3" onClick={() => navigate("/missions")}>
        <ChevronLeft size={16} className="mr-1" /> Retour à la liste
      </Button>
      <div className="bg-white rounded shadow p-6 flex flex-col gap-4" style={{ fontFamily: "'PT Sans',sans-serif" }}>
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-xl font-bold">Détails de la mission</h2>
          <Button variant="secondary" onClick={() => navigate(`/missions/${id}/edit`)}>
            <Edit size={16} className="mr-1" />
            Éditer
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 pt-4">
          <div>
            <div className="text-sm text-gray-600">Référence</div>
            <div className="font-semibold">{mission.ref}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Client</div>
            <div className="font-semibold">{mission.client}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Chauffeur</div>
            <div className="font-semibold">{mission.chauffeur || <span className="italic text-onelog-nuit/40">Aucun</span>}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Date</div>
            <div className="font-semibold">{mission.date}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Statut</div>
            <div className="font-semibold">{mission.status}</div>
          </div>
          <div className="sm:col-span-2">
            <div className="text-sm text-gray-600">Description</div>
            <div className="font-semibold">
              {mission.description || <span className="italic text-onelog-nuit/40">Aucune</span>}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
