
import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type Mission = {
  id: string;
  ref: string;
  client: string;
  chauffeur?: string;
  date: string;
  status: string;
  description?: string;
  // Champs ajoutés pour coller au schéma missions de la BDD
  type_de_marchandise?: string;
  volume?: number;
  poids?: number;
  lieu_enlevement?: string;
  lieu_livraison?: string;
};

type MissionsTableProps = {
  missionsPage: Mission[];
  isLoading: boolean;
  error?: Error | null;
  onDeleteSuccess?: () => void;
  refetchKey: any[];
};

export default function MissionsTable({
  missionsPage = [], // fallback par défaut
  isLoading,
  error,
  onDeleteSuccess,
  refetchKey
}: MissionsTableProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: deleteMission, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      // @ts-ignore
      const { error } = await window.supabase.from("missions").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: "Mission supprimée", description: "La mission a été supprimée avec succès." });
      queryClient.invalidateQueries({ queryKey: ["missions"] });
      onDeleteSuccess?.();
    },
    onError: (err: any) => {
      toast({ title: "Erreur lors de la suppression", description: err.message, variant: "destructive" });
    },
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Référence</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Chauffeur</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Vol (m³)</TableHead>
          <TableHead>Poids (kg)</TableHead>
          <TableHead>Enlèvement</TableHead>
          <TableHead>Livraison</TableHead>
          <TableHead>Description</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={12} className="text-center py-8">
              <span className="animate-spin h-7 w-7 border-4 border-onelog-bleu border-t-transparent rounded-full inline-block" />
            </TableCell>
          </TableRow>
        ) : (Array.isArray(missionsPage) && missionsPage.length > 0) ? missionsPage.map((m) => (
          <TableRow key={m.id} className="hover:bg-onelog-bleu/10">
            <TableCell style={{ fontFamily: "'PT Sans',sans-serif" }}>{m.ref}</TableCell>
            <TableCell style={{ fontFamily: "'PT Sans',sans-serif" }}>{m.client}</TableCell>
            <TableCell style={{ fontFamily: "'PT Sans',sans-serif" }}>{m.chauffeur || <span className="italic text-onelog-nuit/40">Aucun</span>}</TableCell>
            <TableCell style={{ fontFamily: "'PT Sans',sans-serif" }}>{m.date}</TableCell>
            <TableCell>
              <span className={"px-2 py-1 rounded text-sm font-semibold " +
                (m.status === "En cours"
                  ? "bg-onelog-citron/60 text-onelog-nuit"
                  : m.status === "Terminée"
                    ? "bg-green-200 text-green-800"
                    : "bg-red-200 text-red-700")}>
                {m.status}
              </span>
            </TableCell>
            <TableCell style={{ fontFamily: "'PT Sans',sans-serif" }}>
              {m.type_de_marchandise || <span className="italic text-onelog-nuit/40">-</span>}
            </TableCell>
            <TableCell style={{ fontFamily: "'PT Sans',sans-serif" }}>
              {typeof m.volume === "number" ? m.volume : <span className="italic text-onelog-nuit/40">-</span>}
            </TableCell>
            <TableCell style={{ fontFamily: "'PT Sans',sans-serif" }}>
              {typeof m.poids === "number" ? m.poids : <span className="italic text-onelog-nuit/40">-</span>}
            </TableCell>
            <TableCell style={{ fontFamily: "'PT Sans',sans-serif" }}>
              {m.lieu_enlevement || <span className="italic text-onelog-nuit/40">-</span>}
            </TableCell>
            <TableCell style={{ fontFamily: "'PT Sans',sans-serif" }}>
              {m.lieu_livraison || <span className="italic text-onelog-nuit/40">-</span>}
            </TableCell>
            <TableCell>
              {m.description && m.description.length > 50 ?
                <span title={m.description} className="underline decoration-dotted cursor-help">
                  {m.description.slice(0, 47)}…
                </span>
                :
                <span>{m.description || <span className="italic text-onelog-nuit/40">Aucune</span>}</span>
              }
            </TableCell>
            <TableCell className="flex gap-1">
              <Button size="sm" variant="ghost" title="Voir" onClick={() => navigate(`/missions/${m.id}`)}>
                <Eye size={16} />
              </Button>
              <Button size="sm" variant="outline" title="Éditer" onClick={() => navigate(`/missions/${m.id}/edit`)}>
                <Edit size={16} />
              </Button>
              <Button size="sm" variant="destructive" disabled={isDeleting} title="Supprimer" onClick={() => {
                if (confirm("Voulez-vous vraiment supprimer cette mission ?")) deleteMission(m.id);
              }}>
                <Trash2 size={16} />
              </Button>
            </TableCell>
          </TableRow>
        )) : (
          <TableRow>
            <TableCell colSpan={12} className="text-center py-8 text-onelog-nuit/60" style={{ fontFamily: "'PT Sans',sans-serif" }}>
              Aucune mission trouvée.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
