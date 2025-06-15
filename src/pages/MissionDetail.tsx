import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Edit, FileText } from "lucide-react";
import { toast } from "@/components/ui/use-toast"; // Nettoyage : harmonisation
import MissionOverview from "./mission-detail/MissionOverview";
import MissionTrackingHistory from "./mission-detail/MissionTrackingHistory";
import MissionExtraDetails from "./mission-detail/MissionExtraDetails";
import MissionStatusTimeline from "./mission-detail/MissionStatusTimeline";

type TrackingPoint = {
  id: string | number;
  label: string;
  timestamp: string;
};

export default function MissionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [generating, setGenerating] = React.useState(false);

  // Fetch mission data
  const { data: mission, isLoading, error } = useQuery({
    queryKey: ["missions-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("missions").select("*").eq("id", id).single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!id,
  });

  // Fetch tracking points
  const { data: trackingPoints, isLoading: loadingTracking } = useQuery({
    queryKey: ["tracking-points", id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from("tracking_points")
        .select("*")
        .eq("mission_id", id)
        .order("recorded_at", { ascending: true });
      if (error) throw new Error(error.message);
      // Transform as needed for MissionTrackingHistory
      return (data || []).map((pt) => ({
        id: pt.id,
        label: `Lat: ${pt.latitude.toFixed(5)}, Lng: ${pt.longitude.toFixed(5)}`,
        timestamp: new Date(pt.recorded_at).toLocaleString(),
      }));
    },
    enabled: !!id,
  });

  // Génération PDF via Edge Function
  const handleGeneratePDF = async () => {
    if (!id) return;
    setGenerating(true);
    toast({ title: "Génération PDF...", description: "Veuillez patienter pendant la génération de la facture." });
    try {
      const { data, error } = await supabase.functions.invoke("generate-invoice-pdf", {
        body: { missionId: id },
      });
      if (error || !data?.pdfUrl) {
        throw new Error(error?.message || "Impossible de générer le PDF.");
      }
      toast({ title: "PDF prêt", description: "La facture PDF est générée, ouverture dans un nouvel onglet." });
      window.open(data.pdfUrl, "_blank");
    } catch (e: any) {
      toast({ title: "Erreur PDF", description: e.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

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
      <div className="flex items-center justify-between mb-3">
        <Button variant="ghost" className="mb-0" onClick={() => navigate("/missions")}>
          <ChevronLeft size={16} className="mr-1" /> Retour à la liste
        </Button>
        <Button
          variant="secondary"
          className="flex gap-1"
          onClick={handleGeneratePDF}
          disabled={generating}
          title="Générer la facture PDF"
        >
          <FileText size={16} />
          Générer PDF
        </Button>
      </div>
      <div className="bg-white rounded shadow p-6 flex flex-col gap-4" style={{ fontFamily: "'PT Sans',sans-serif" }}>
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-xl font-bold">Détails de la mission</h2>
          <Button variant="secondary" onClick={() => navigate(`/missions/${id}/edit`)}>
            <Edit size={16} className="mr-1" />
            Éditer
          </Button>
        </div>
        <MissionOverview mission={mission} />
        {/* Timeline */}
        <MissionStatusTimeline missionId={id!} />
        <MissionTrackingHistory points={loadingTracking ? [] : trackingPoints || []} />
        <MissionExtraDetails mission={mission} />
      </div>
    </main>
  );
}
