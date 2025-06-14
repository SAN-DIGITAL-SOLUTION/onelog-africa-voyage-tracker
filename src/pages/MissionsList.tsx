
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ChevronRight, ChevronLeft, Edit, Trash2, Eye, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink } from "@/components/ui/pagination";

const PAGE_SIZE = 10;

const statusOptions = ["En cours", "Terminée", "Annulée"];

export default function MissionsList() {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [filterClient, setFilterClient] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("");
  const [debounced, setDebounced] = React.useState(search);

  React.useEffect(() => {
    const handler = setTimeout(() => setDebounced(search), 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Récupérer les missions paginées + filtres/search (d'abord tout, puis côté JS paginer)
  const { data: missions, isLoading, error, refetch } = useQuery({
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

  // Pagination
  const missionsPage = missions?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) ?? [];
  const pageCount = Math.ceil((missions?.length ?? 0) / PAGE_SIZE);

  // Supprimer une mission
  const queryClient = useQueryClient();
  const { mutate: deleteMission, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("missions").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: "Mission supprimée", description: "La mission a été supprimée avec succès.", });
      queryClient.invalidateQueries({ queryKey: ["missions"] });
    },
    onError: (err: any) => {
      toast({ title: "Erreur lors de la suppression", description: err.message, variant: "destructive" });
    },
  });

  // Rendu
  return (
    <main className="container mx-auto pt-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'PT Sans',sans-serif" }}>Missions</h1>
        <Button onClick={() => navigate("/missions/new")} className="bg-onelog-bleu text-white font-bold px-4">
          <ChevronRight size={18} className="mr-2" /> Nouvelle mission
        </Button>
      </div>
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Input
            placeholder="Rechercher par référence…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-10"
            style={{ fontFamily: "'PT Sans',sans-serif" }}
          />
          <Search className="absolute left-3 top-2.5 text-onelog-bleu opacity-50" size={20} />
        </div>
        <Input
          placeholder="Filtrer par client…" value={filterClient} onChange={e => { setFilterClient(e.target.value); setPage(1); }}
          style={{ fontFamily: "'PT Sans',sans-serif" }}
        />
        <select
          className="border px-3 py-2 rounded text-base md:text-sm bg-white" style={{ fontFamily: "'PT Sans',sans-serif" }}
          value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
        >
          <option value="">Tous statuts</option>
          {statusOptions.map(s => <option value={s} key={s}>{s}</option>)}
        </select>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Référence</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Chauffeur</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Description</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <span className="animate-spin h-7 w-7 border-4 border-onelog-bleu border-t-transparent rounded-full inline-block" />
                </TableCell>
              </TableRow>
            ) : (missionsPage.length > 0 ? missionsPage.map((m: any) => (
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
                <TableCell colSpan={7} className="text-center py-8 text-onelog-nuit/60" style={{ fontFamily: "'PT Sans',sans-serif" }}>
                  Aucune mission trouvée.
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {pageCount > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              {page === 1 ? (
                <span
                  className="opacity-50 select-none pointer-events-none gap-1 pl-2.5 inline-flex items-center"
                  aria-disabled="true"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </span>
              ) : (
                <PaginationPrevious onClick={() => setPage(p => Math.max(1, p - 1))} />
              )}
            </PaginationItem>
            {[...Array(pageCount)].map((_, i) => (
              <PaginationItem key={i + 1}>
                <PaginationLink isActive={i + 1 === page} onClick={() => setPage(i + 1)}>
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              {page === pageCount ? (
                <span
                  className="opacity-50 select-none pointer-events-none gap-1 pr-2.5 inline-flex items-center"
                  aria-disabled="true"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </span>
              ) : (
                <PaginationNext onClick={() => setPage(p => Math.min(pageCount, p + 1))} />
              )}
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      {error && <div className="text-red-600 mt-2">Erreur : {error.message}</div>}
    </main>
  );
}
