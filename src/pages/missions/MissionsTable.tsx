
import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Mission = {
  id: string;
  ref: string;
  client: string;
  chauffeur?: string;
  date: string;
  status: string;
  description?: string;
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

// Composant pour mobile - format carte
function MissionCard({ mission, onEdit, onView, onDelete, isDeleting }: {
  mission: Mission;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="bg-white rounded-lg border p-4 mb-4 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg">{mission.ref}</h3>
          <p className="text-gray-600">{mission.client}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onView}>
              <Eye size={16} className="mr-2" />
              Voir
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <Edit size={16} className="mr-2" />
              Éditer
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={onDelete}
              disabled={isDeleting}
              className="text-red-600"
            >
              <Trash2 size={16} className="mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-500">Date:</span>
          <p>{mission.date}</p>
        </div>
        <div>
          <span className="text-gray-500">Statut:</span>
          <span className={"px-2 py-1 rounded text-xs font-semibold " +
            (mission.status === "En cours"
              ? "bg-yellow-200 text-yellow-800"
              : mission.status === "Terminée"
                ? "bg-green-200 text-green-800"
                : "bg-red-200 text-red-700")}>
            {mission.status}
          </span>
        </div>
        {mission.chauffeur && (
          <div>
            <span className="text-gray-500">Chauffeur:</span>
            <p>{mission.chauffeur}</p>
          </div>
        )}
        {mission.type_de_marchandise && (
          <div>
            <span className="text-gray-500">Type:</span>
            <p>{mission.type_de_marchandise}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MissionsTable({
  missionsPage,
  isLoading,
  error,
  onDeleteSuccess,
  refetchKey
}: MissionsTableProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const { mutate: deleteMission, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("missions").delete().eq("id", id);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <span className="animate-spin h-7 w-7 border-4 border-onelog-bleu border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Erreur lors du chargement des missions
      </div>
    );
  }

  // Vue mobile - format cartes
  if (isMobile) {
    if (missionsPage.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          Aucune mission trouvée.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {missionsPage.map((mission) => (
          <MissionCard
            key={mission.id}
            mission={mission}
            onView={() => navigate(`/missions/${mission.id}`)}
            onEdit={() => navigate(`/missions/${mission.id}/edit`)}
            onDelete={() => {
              if (confirm("Voulez-vous vraiment supprimer cette mission ?")) {
                deleteMission(mission.id);
              }
            }}
            isDeleting={isDeleting}
          />
        ))}
      </div>
    );
  }

  // Vue desktop - tableau
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
        {missionsPage.length > 0 ? missionsPage.map((m) => (
          <TableRow key={m.id} className="hover:bg-onelog-bleu/10">
            <TableCell>{m.ref}</TableCell>
            <TableCell>{m.client}</TableCell>
            <TableCell>{m.chauffeur || <span className="italic text-gray-400">Aucun</span>}</TableCell>
            <TableCell>{m.date}</TableCell>
            <TableCell>
              <span className={"px-2 py-1 rounded text-sm font-semibold " +
                (m.status === "En cours"
                  ? "bg-yellow-200 text-yellow-800"
                  : m.status === "Terminée"
                    ? "bg-green-200 text-green-800"
                    : "bg-red-200 text-red-700")}>
                {m.status}
              </span>
            </TableCell>
            <TableCell>
              {m.type_de_marchandise || <span className="italic text-gray-400">-</span>}
            </TableCell>
            <TableCell>
              {typeof m.volume === "number" ? m.volume : <span className="italic text-gray-400">-</span>}
            </TableCell>
            <TableCell>
              {typeof m.poids === "number" ? m.poids : <span className="italic text-gray-400">-</span>}
            </TableCell>
            <TableCell>
              {m.lieu_enlevement || <span className="italic text-gray-400">-</span>}
            </TableCell>
            <TableCell>
              {m.lieu_livraison || <span className="italic text-gray-400">-</span>}
            </TableCell>
            <TableCell>
              {m.description && m.description.length > 50 ?
                <span title={m.description} className="underline decoration-dotted cursor-help">
                  {m.description.slice(0, 47)}…
                </span>
                :
                <span>{m.description || <span className="italic text-gray-400">Aucune</span>}</span>
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
                if (confirm("Voulez-vous vraiment supprimer cette mission ?")) deleteMission(m.id);
              }}>
                <Trash2 size={16} />
              </Button>
            </TableCell>
          </TableRow>
        )) : (
          <TableRow>
            <TableCell colSpan={12} className="text-center py-8 text-gray-500">
              Aucune mission trouvée.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
