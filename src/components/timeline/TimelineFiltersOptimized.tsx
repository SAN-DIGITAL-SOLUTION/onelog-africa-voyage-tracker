import React, { useCallback, useMemo } from 'react';
import { useTimelineFilters } from '@/hooks/useTimelineFilters';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { X, Filter as FilterIcon, Calendar as CalendarIcon, Search } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Types
type FilterOption = {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
};

interface TimelineFiltersOptimizedProps {
  className?: string;
  availableTypes?: FilterOption[];
  availableStatuses?: FilterOption[];
}

// Composant optimisé avec React.memo
const TimelineFiltersOptimized: React.FC<TimelineFiltersOptimizedProps> = React.memo(({
  className = '',
  availableTypes = [
    { value: 'departure', label: 'Départ' },
    { value: 'arrival', label: 'Arrivée' },
    { value: 'incident', label: 'Incident' },
    { value: 'maintenance', label: 'Maintenance' },
  ],
  availableStatuses = [
    { value: 'completed', label: 'Terminé' },
    { value: 'in_progress', label: 'En cours' },
    { value: 'pending', label: 'En attente' },
    { value: 'cancelled', label: 'Annulé' },
  ],
}) => {
  const {
    filters,
    updateFilter,
    resetFilters,
    saveFilterPreset,
    loadFilterPreset,
  } = useTimelineFilters();

  // Mise à jour des filtres avec gestion des types
  const handleFilterChange = useCallback((key: string, value: string | Date | null) => {
    updateFilter(key, value ? value.toString() : '');
  }, [updateFilter]);

  // Vérifier s'il y a des filtres actifs
  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(Boolean).length;
  }, [filters]);

  // Réinitialisation des filtres
  const handleReset = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  // Gestionnaire de recherche
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilterChange('search', e.target.value);
  }, [handleFilterChange]);

  // Gestionnaire de sélection de type
  const handleTypeChange = useCallback((value: string) => {
    handleFilterChange('type', value);
  }, [handleFilterChange]);

  // Gestionnaire de sélection de statut
  const handleStatusChange = useCallback((value: string) => {
    handleFilterChange('status', value);
  }, [handleFilterChange]);

  // Gestionnaire de sélection de date
  const handleDateChange = useCallback((dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    handleFilterChange('startDate', start);
    handleFilterChange('endDate', end);
  }, [handleFilterChange]);

  // Valeurs sélectionnées pour les sélecteurs
  const selectedDates = useMemo(() => {
    const start = filters.startDate ? new Date(filters.startDate) : null;
    const end = filters.endDate ? new Date(filters.endDate) : null;
    return [start, end] as [Date | null, Date | null];
  }, [filters.startDate, filters.endDate]);

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Barre de recherche */}
        <div className="flex-1">
          <Input
            placeholder="Rechercher des événements..."
            prefix={<Search className="text-gray-400" size={18} />}
            value={filters.search || ''}
            onChange={handleSearch}
            className="w-full"
          />
        </div>

        {/* Filtre par type */}
        <div className="w-full md:w-48">
          <Select
            placeholder="Type d'événement"
            options={availableTypes}
            value={filters.type}
            onChange={handleTypeChange}
            allowClear
          />
        </div>

        {/* Filtre par statut */}
        <div className="w-full md:w-48">
          <Select
            placeholder="Statut"
            options={availableStatuses}
            value={filters.status}
            onChange={handleStatusChange}
            allowClear
          />
        </div>

        {/* Sélecteur de plage de dates */}
        <div className="w-full md:w-64">
          <DatePicker.RangePicker
            value={selectedDates}
            onChange={handleDateChange}
            className="w-full"
            format="DD/MM/YYYY"
            placeholder={['Début', 'Fin']}
            suffixIcon={<CalendarIcon className="text-gray-400" size={16} />}
            locale={fr}
          />
        </div>

        {/* Bouton de réinitialisation */}
        <Tooltip content="Réinitialiser les filtres" placement="top">
          <Button
            type="default"
            onClick={handleReset}
            disabled={activeFiltersCount === 0}
            icon={<X size={16} />}
            className="flex-shrink-0"
          >
            {activeFiltersCount > 0 && (
              <Badge count={activeFiltersCount} className="ml-1" />
            )}
          </Button>
        </Tooltip>
      </div>

      {/* Affichage des filtres actifs */}
      {activeFiltersCount > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null;

            let label = value;
            
            // Formater les labels selon le type de filtre
            if (key === 'startDate' || key === 'endDate') {
              label = format(new Date(value), 'PP', { locale: fr });
            } else if (key === 'type') {
              const type = availableTypes.find(t => t.value === value);
              if (type) label = type.label;
            } else if (key === 'status') {
              const status = availableStatuses.find(s => s.value === value);
              if (status) label = status.label;
            }

            return (
              <Badge
                key={key}
                closable
                onClose={() => handleFilterChange(key, '')}
                className="inline-flex items-center gap-1 bg-gray-100 text-gray-800"
              >
                <span className="font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </span>
                <span>{label}</span>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
});

TimelineFiltersOptimized.displayName = 'TimelineFiltersOptimized';

export { TimelineFiltersOptimized };

export type { FilterOption as TimelineFilterOption };
