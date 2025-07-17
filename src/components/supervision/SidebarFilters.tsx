import React, { useState } from 'react';
import { ButtonVariants } from '@/components/ui-system';
import { FilterIcon, XIcon, CheckIcon } from 'lucide-react';

interface FilterOptions {
  status: Array<{ value: string; label: string; color: string }>;
  zones: Array<{ value: string; label: string }>;
  drivers: Array<{ value: string; label: string }>;
}

interface SidebarFiltersProps {
  filters: {
    status: string[];
    zone: string[];
    driver: string[];
  };
  onFiltersChange: (filters: { status: string[]; zone: string[]; driver: string[] }) => void;
  className?: string;
}

const SidebarFilters: React.FC<SidebarFiltersProps> = ({ 
  filters, 
  onFiltersChange, 
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Options de filtres disponibles
  const filterOptions: FilterOptions = {
    status: [
      { value: 'active', label: 'Actif', color: '#009688' },
      { value: 'idle', label: 'Inactif', color: '#F9A825' },
      { value: 'maintenance', label: 'Maintenance', color: '#E65100' },
    ],
    zones: [
      { value: 'dakar', label: 'Dakar' },
      { value: 'thies', label: 'Thiès' },
      { value: 'kaolack', label: 'Kaolack' },
      { value: 'saint-louis', label: 'Saint-Louis' },
    ],
    drivers: [
      { value: 'amadou-ba', label: 'Amadou Ba' },
      { value: 'moussa-diop', label: 'Moussa Diop' },
      { value: 'ibrahima-fall', label: 'Ibrahima Fall' },
      { value: 'fatou-sow', label: 'Fatou Sow' },
    ],
  };

  const handleFilterToggle = (category: keyof typeof filters, value: string) => {
    const currentFilters = filters[category];
    const newFilters = currentFilters.includes(value)
      ? currentFilters.filter(item => item !== value)
      : [...currentFilters, value];

    onFiltersChange({
      ...filters,
      [category]: newFilters,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      status: [],
      zone: [],
      driver: [],
    });
  };

  const getActiveFiltersCount = () => {
    return filters.status.length + filters.zone.length + filters.driver.length;
  };

  const FilterSection = ({ 
    title, 
    category, 
    options 
  }: { 
    title: string; 
    category: keyof typeof filters; 
    options: Array<{ value: string; label: string; color?: string }> 
  }) => (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-[#263238] mb-3 flex items-center">
        {title}
        {filters[category].length > 0 && (
          <span className="ml-2 bg-[#E65100] text-white text-xs rounded-full px-2 py-0.5">
            {filters[category].length}
          </span>
        )}
      </h3>
      <div className="space-y-2">
        {options.map(option => (
          <label 
            key={option.value}
            className="flex items-center space-x-3 cursor-pointer hover:bg-[#F4F4F4] p-2 rounded-md transition-colors"
          >
            <div className="relative">
              <input
                type="checkbox"
                checked={filters[category].includes(option.value)}
                onChange={() => handleFilterToggle(category, option.value)}
                className="sr-only"
                data-testid={`${category}-filter-${option.value}`}
              />
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                filters[category].includes(option.value)
                  ? 'bg-[#009688] border-[#009688]'
                  : 'border-[#263238]/30 hover:border-[#009688]'
              }`}>
                {filters[category].includes(option.value) && (
                  <CheckIcon className="w-3 h-3 text-white" />
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-1">
              {option.color && (
                <div 
                  className="w-3 h-3 rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: option.color }}
                ></div>
              )}
              <span className="text-sm text-[#263238]">{option.label}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div 
      className={`bg-white rounded-lg shadow-md border border-[#1A3C40]/10 ${className}`}
      data-testid="sidebar-filters"
    >
      {/* Header */}
      <div className="p-4 border-b border-[#F4F4F4]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FilterIcon className="w-5 h-5 text-[#1A3C40]" />
            <h2 className="text-lg font-semibold text-[#1A3C40]">Filtres</h2>
            {getActiveFiltersCount() > 0 && (
              <span className="bg-[#E65100] text-white text-xs rounded-full px-2 py-1">
                {getActiveFiltersCount()}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[#263238]/50 hover:text-[#263238] transition-colors"
            data-testid="toggle-filters"
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>
      </div>

      {/* Contenu des filtres */}
      {isExpanded && (
        <div className="p-4">
          <FilterSection
            title="Statut des véhicules"
            category="status"
            options={filterOptions.status}
          />

          <FilterSection
            title="Zones géographiques"
            category="zone"
            options={filterOptions.zones}
          />

          <FilterSection
            title="Chauffeurs"
            category="driver"
            options={filterOptions.drivers}
          />

          {/* Actions */}
          <div className="pt-4 border-t border-[#F4F4F4] space-y-3">
            <ButtonVariants
              variant="secondary"
              size="sm"
              onClick={clearAllFilters}
              disabled={getActiveFiltersCount() === 0}
              className="w-full"
              data-testid="clear-all-filters"
            >
              <XIcon className="w-4 h-4 mr-2" />
              Effacer tous les filtres
            </ButtonVariants>

            <div className="text-xs text-[#263238]/60 text-center">
              {getActiveFiltersCount() === 0 
                ? 'Aucun filtre actif' 
                : `${getActiveFiltersCount()} filtre${getActiveFiltersCount() > 1 ? 's' : ''} actif${getActiveFiltersCount() > 1 ? 's' : ''}`
              }
              {getActiveFiltersCount() > 0 && (
                <span data-testid="active-filters-count">
                  {getActiveFiltersCount()}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Résumé compact quand réduit */}
      {!isExpanded && getActiveFiltersCount() > 0 && (
        <div className="p-4" data-testid="collapsed-filters-summary">
          <div className="flex flex-wrap gap-2">
            {filters.status.map(status => (
              <span key={status} className="bg-[#009688] text-white text-xs px-2 py-1 rounded-full">
                {filterOptions.status.find(s => s.value === status)?.label}
              </span>
            ))}
            {filters.zone.map(zone => (
              <span key={zone} className="bg-[#F9A825] text-[#263238] text-xs px-2 py-1 rounded-full">
                {filterOptions.zones.find(z => z.value === zone)?.label}
              </span>
            ))}
            {filters.driver.map(driver => (
              <span key={driver} className="bg-[#E65100] text-white text-xs px-2 py-1 rounded-full">
                {filterOptions.drivers.find(d => d.value === driver)?.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarFilters;
