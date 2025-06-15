
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type NotificationFiltersProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  triggerFilter: string;
  onTriggerFilterChange: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
};

const triggerOptions = [
  { value: "created", label: "Mission créée" },
  { value: "modified", label: "Mission modifiée" },
  { value: "delivered", label: "Mission livrée" },
  { value: "cancelled", label: "Mission annulée" },
  { value: "in_progress", label: "Mission en cours" },
  { value: "custom", label: "Personnalisé" },
];

export default function NotificationFilters({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  triggerFilter,
  onTriggerFilterChange,
  onClearFilters,
  hasActiveFilters,
}: NotificationFiltersProps) {
  return (
    <div className="bg-white rounded p-4 shadow mb-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-48">
          <label className="text-sm font-medium mb-1 block">
            Rechercher
          </label>
          <Input
            placeholder="Rechercher par destinataire ou message..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <div className="min-w-32">
          <label className="text-sm font-medium mb-1 block">
            Type
          </label>
          <Select value={typeFilter} onValueChange={onTypeFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Tous" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-48">
          <label className="text-sm font-medium mb-1 block">
            Évènement
          </label>
          <Select value={triggerFilter} onValueChange={onTriggerFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Tous" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous</SelectItem>
              {triggerOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="flex items-center gap-2"
          >
            <X size={16} />
            Effacer filtres
          </Button>
        )}
      </div>
    </div>
  );
}
