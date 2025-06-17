
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMissions } from "./missions/useMissions";
import MissionFilters from "./missions/MissionFilters";
import MissionsTable from "./missions/MissionsTable";
import MissionsPagination from "./missions/MissionsPagination";
import MissionsExportDropdown from "./missions/MissionsExportDropdown";
import { useRealtimeMissions } from "@/hooks/useRealtimeMissions";
import RealtimeStatusIndicator from "@/components/RealtimeStatusIndicator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function MissionsList() {
  const { user } = useAuth();

  // Hook pour les mises à jour temps réel
  useRealtimeMissions();

  // Utilisation du hook personnalisé pour récupérer les missions
  const {
    missions,
    missionsPage,
    isLoading,
    error,
    page,
    setPage,
    search,
    setSearch,
    filterClient,
    setFilterClient,
    filterStatus,
    setFilterStatus,
    pageCount,
    refetchKey,
  } = useMissions();

  const handleDeleteMission = async (id: string) => {
    try {
      const { error } = await supabase.from("missions").delete().eq("id", id);
      if (error) throw new Error(error.message);
      // Trigger re-fetch by updating search (this will cause the query to re-run)
      setSearch(search + " ");
      setTimeout(() => setSearch(search), 100);
      toast({ title: "Mission supprimée", description: "La mission a été supprimée avec succès." });
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error.message);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const clearFilters = () => {
    setSearch("");
    setFilterStatus("");
    setFilterClient("");
    setPage(1);
  };

  const hasActiveFilters = search !== "" || filterStatus !== "" || filterClient !== "";

  if (isLoading) {
    return (
      <main className="container mx-auto pt-8">
        <div className="flex justify-center items-center h-64">
          <span className="animate-spin h-8 w-8 border-4 border-onelog-bleu border-t-transparent rounded-full" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto pt-8">
        <div className="text-center text-red-600">
          Erreur lors du chargement des missions
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto pt-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Mes missions</h1>
          <p className="text-gray-600">
            Gérez vos missions de transport et logistique
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <MissionsExportDropdown missions={missions || []} />
          <Button asChild className="w-full sm:w-auto">
            <Link to="/missions/new">
              <Plus size={16} className="mr-1" />
              Nouvelle mission
            </Link>
          </Button>
        </div>
      </div>

      <MissionFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={filterStatus}
        onStatusFilterChange={setFilterStatus}
        clientFilter={filterClient}
        onClientFilterChange={setFilterClient}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <div className="overflow-x-auto">
        <MissionsTable
          missionsPage={missionsPage || []}
          isLoading={isLoading}
          error={error}
          onDeleteSuccess={() => {
            // Trigger re-fetch
            setSearch(search + " ");
            setTimeout(() => setSearch(search), 100);
          }}
          refetchKey={refetchKey}
        />
      </div>

      <MissionsPagination
        currentPage={page}
        totalCount={missions?.length || 0}
        pageSize={10}
        onPageChange={setPage}
        hasActiveFilters={hasActiveFilters}
        filteredCount={missionsPage?.length || 0}
        pageCount={pageCount}
      />

      <RealtimeStatusIndicator />
    </main>
  );
}
