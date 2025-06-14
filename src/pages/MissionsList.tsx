
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink } from "@/components/ui/pagination";
import { useMissions, PAGE_SIZE } from "./missions/useMissions";
import MissionsTable from "./missions/MissionsTable";
import MissionFilters from "./missions/MissionFilters";

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
        <Button onClick={() => navigate("/missions/new")} className="bg-onelog-bleu text-white font-bold px-4">
          <ChevronRight size={18} className="mr-2" /> Nouvelle mission
        </Button>
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
                <PaginationPrevious onClick={() => setPage(page - 1)} />
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
                <PaginationNext onClick={() => setPage(page + 1)} />
              )}
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      {error && <div className="text-red-600 mt-2">Erreur : {error.message}</div>}
    </main>
  );
}

// Note: This file is now refactored. If it grows again, consider further splitting into smaller components.
