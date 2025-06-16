import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

export default function MissionsList() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Hook pour les mises à jour temps réel
  useRealtimeMissions();

  // Utilisation du hook personnalisé pour récupérer les missions
  const {
    data: missions,
    isLoading,
    error,
    totalCount,
    refetch,
  } = useMissions({
    searchTerm,
    statusFilter,
    clientFilter,
    currentPage,
    pageSize,
  });

  const handleDeleteMission = async (id: string) => {
    try {
      const { error } = await supabase.from("missions").delete().eq("id", id);
      if (error) throw new Error(error.message);
      refetch();
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error.message);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setClientFilter("");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "" || clientFilter !== "";

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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Mes missions</h1>
          <p className="text-gray-600">
            Gérez vos missions de transport et logistique
          </p>
        </div>
        <div className="flex gap-2">
          <MissionsExportDropdown missions={missions || []} />
          <Button asChild>
            <Link to="/missions/new">
              <Plus size={16} className="mr-1" />
              Nouvelle mission
            </Link>
          </Button>
        </div>
      </div>

      <MissionFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        clientFilter={clientFilter}
        onClientFilterChange={setClientFilter}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <MissionsTable
        missions={missions || []}
        onDeleteMission={handleDeleteMission}
      />

      <MissionsPagination
        currentPage={currentPage}
        totalCount={totalCount || 0}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        hasActiveFilters={hasActiveFilters}
        filteredCount={missions?.length || 0}
      />

      <RealtimeStatusIndicator />
    </main>
  );
}
