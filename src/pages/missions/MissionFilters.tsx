
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { statusOptions } from "./useMissions";

type MissionFiltersProps = {
  search: string;
  setSearch: (v: string) => void;
  filterClient: string;
  setFilterClient: (v: string) => void;
  filterStatus: string;
  setFilterStatus: (v: string) => void;
};

export default function MissionFilters({
  search,
  setSearch,
  filterClient,
  setFilterClient,
  filterStatus,
  setFilterStatus,
}: MissionFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-3 mb-4">
      <div className="relative flex-1">
        <Input
          placeholder="Rechercher par référence…"
          value={search}
          onChange={e => { setSearch(e.target.value); }}
          className="pl-10"
          style={{ fontFamily: "'PT Sans',sans-serif" }}
        />
        <Search className="absolute left-3 top-2.5 text-onelog-bleu opacity-50" size={20} />
      </div>
      <Input
        placeholder="Filtrer par client…"
        value={filterClient}
        onChange={e => { setFilterClient(e.target.value); }}
        style={{ fontFamily: "'PT Sans',sans-serif" }}
      />
      <select
        className="border px-3 py-2 rounded text-base md:text-sm bg-white"
        style={{ fontFamily: "'PT Sans',sans-serif" }}
        value={filterStatus}
        onChange={e => { setFilterStatus(e.target.value); }}
      >
        <option value="">Tous statuts</option>
        {statusOptions.map(s => <option value={s} key={s}>{s}</option>)}
      </select>
    </div>
  );
}
