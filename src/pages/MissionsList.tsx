import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMissions } from "./missions/useMissions";
import MissionsTable from "./missions/MissionsTable";
import MissionFilters from "./missions/MissionFilters";
import MissionsPagination from "./missions/MissionsPagination";
import MissionsExportDropdown from "./missions/MissionsExportDropdown";

export default function MissionsList() {
  const navigate = useNavigate();
  const {
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

  // Reset pagination when filters change
  React.useEffect(() => { setPage(1); }, [search, filterClient, filterStatus]);

  return (
    <main className="container mx-auto pt-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'PT Sans',sans-serif" }}>Missions</h1>
        <div className="flex gap-1">
          <MissionsExportDropdown missions={missionsPage} />
          <Button onClick={() => navigate("/missions/new")} className="bg-onelog-bleu text-white font-bold px-4">
            <ChevronRight size={18} className="mr-2" /> Nouvelle mission
          </Button>
        </div>
      </div>
      <MissionFilters
        search={search}
        setSearch={setSearch}
        filterClient={filterClient}
        setFilterClient={setFilterClient}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />
      <div className="overflow-x-auto">
        <MissionsTable
          missionsPage={missionsPage}
          isLoading={isLoading}
          error={error}
          refetchKey={refetchKey}
        />
      </div>
      <MissionsPagination
        currentPage={page}
        totalPages={pageCount}
        onPageChange={setPage}
      />
      {error && <div className="text-red-600 mt-2">Erreur : {error.message}</div>}
    </main>
  );
}

// Note: This file is now refactored. If it grows again, consider further splitting into smaller components.
