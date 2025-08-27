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
  const [priorityFilter, setPriorityFilter] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Appel direct du hook (la logique interne doit protéger si user est null)
  useRealtimeMissions(user);

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
    setPriorityFilter("");
    setClientFilter("");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "" || priorityFilter !== "" || clientFilter !== "";

  if (!user) {
    return (
      <main className="container mx-auto pt-8">
        <div className="flex justify-center items-center h-64">
          <span className="text-gray-500">Chargement de l'utilisateur...</span>
        </div>
      </main>
    );
  }

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
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-blue-50">
      <main className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-6">
        {/* Header avec design amélioré et plus d'espace */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10 mb-8 sm:mb-10 border border-gray-100 max-w-7xl mx-auto">
          <div className="flex flex-col xl:flex-row justify-between items-start gap-6 xl:gap-8 mb-6 xl:mb-8">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-3">Mes missions</h1>
                <p className="text-gray-600 text-xl">
                  Gérez vos missions de transport et logistique en temps réel
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full xl:w-auto">
              <MissionsExportDropdown missions={missions || []} />
              <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-4 text-lg">
                <Link to="/missions/new">
                  <Plus size={20} className="mr-3" />
                  Nouvelle mission
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Stats rapides avec plus d'espace */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 xl:gap-8 mt-8">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-green-600 font-medium mb-1">Terminées</p>
                  <p className="text-2xl font-bold text-green-800">{missions?.filter(m => m.status === 'completed').length || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-blue-600 font-medium mb-1">En cours</p>
                  <p className="text-2xl font-bold text-blue-800">{missions?.filter(m => m.status === 'in_progress').length || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-orange-600 font-medium mb-1">En attente</p>
                  <p className="text-2xl font-bold text-orange-800">{missions?.filter(m => m.status === 'pending').length || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-purple-600 font-medium mb-1">Total</p>
                  <p className="text-2xl font-bold text-purple-800">{missions?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres avec design amélioré et plus d'espace */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8 sm:mb-10 border border-gray-100 max-w-7xl mx-auto">
          <MissionFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            priorityFilter={priorityFilter}
            onPriorityChange={setPriorityFilter}
          />
        </div>

        {/* Table avec design amélioré et plus d'espace */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8 sm:mb-10 max-w-7xl mx-auto">
          <div className="p-6 sm:p-8">
            <MissionsTable
              missions={missions || []}
              onDeleteMission={handleDeleteMission}
            />
          </div>
        </div>

        {/* Pagination avec design amélioré et plus d'espace */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100 mb-8 sm:mb-10 max-w-7xl mx-auto">
          <MissionsPagination
            currentPage={currentPage}
            totalCount={totalCount || 0}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            hasActiveFilters={hasActiveFilters}
            filteredCount={missions?.length || 0}
          />
        </div>

        <RealtimeStatusIndicator />
      </main>
    </div>
  );
}
