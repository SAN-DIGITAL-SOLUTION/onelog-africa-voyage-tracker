
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
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
import MissionFilters from "./missions/MissionFilters";

export default function MissionsList() {
  const { user } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "status" | "client">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedMissions, setSelectedMissions] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>("");

  const handleDeleteMission = async (id: string) => {
    try {
      const { error } = await supabase.from("missions").delete().eq("id", id);
      if (error) throw new Error(error.message);
      // Trigger re-fetch by updating search (this will cause the query to re-run)
      setSearchTerm(searchTerm + " ");
      setTimeout(() => setSearchTerm(searchTerm), 100);
      toast({ title: "Mission supprimée", description: "La mission a été supprimée avec succès." });
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error.message);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const handleRefresh = () => {
    // Trigger re-fetch by updating search (this will cause the query to re-run)
    setSearchTerm(searchTerm + " ");
    setTimeout(() => setSearchTerm(searchTerm), 100);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all";

  if (!user) {
    return (
      <main className="container mx-auto pt-8">
        <div className="flex justify-center items-center h-64">
          <span className="text-gray-500">Chargement de l'utilisateur...</span>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto pt-8">
        <div className="flex justify-center items-center h-64">
          <span className="animate-spin h-8 w-8 border-4 border-onelog-bleu border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto pt-8">
        <div className="text-center text-red-600">
          Erreur lors du chargement des missions
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-blue-50">
      <main className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10 mb-8 sm:mb-10 border border-gray-100 max-w-7xl mx-auto">
          <div className="flex flex-col xl:flex-row justify-between items-start gap-6 xl:gap-8 mb-6 xl:mb-8">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <Truck className="w-10 h-10 text-white" />
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
          <MissionsFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />
          <MissionsTable
            missions={missions || []}
            onDeleteMission={handleDeleteMission}
          />
          <MissionsPagination
            currentPage={currentPage}
            totalCount={missions.length}
            pageSize={itemsPerPage}
            onPageChange={setCurrentPage}
            hasActiveFilters={hasActiveFilters}
            filteredCount={missions.length}
          />
        </div>
        <RealtimeStatusIndicator />
      </main>

      <RealtimeStatusIndicator />
    </div>
  );
}
