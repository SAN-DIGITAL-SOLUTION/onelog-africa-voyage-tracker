import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Filter,
  Calendar,
  Truck,
  AlertTriangle,
  X,
  ChevronDown
} from 'lucide-react';
import { Button, Badge } from '../ui-system';
import { TimelineFilters as TimelineFiltersType, TimelineFiltersProps } from './types';

const TimelineFilters: React.FC<TimelineFiltersProps> = ({
  filters,
  onFiltersChange,
  availableVehicles,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Event type options
  const eventTypeOptions = [
    { value: 'departure', label: 'Départs', icon: Truck },
    { value: 'arrival', label: 'Arrivées', icon: Truck },
    { value: 'incident', label: 'Incidents', icon: AlertTriangle },
    { value: 'maintenance', label: 'Maintenance', icon: AlertTriangle },
    { value: 'delay', label: 'Retards', icon: AlertTriangle }
  ] as const;

  // Status options
  const statusOptions = [
    { value: 'completed', label: 'Terminé' },
    { value: 'in_progress', label: 'En cours' },
    { value: 'cancelled', label: 'Annulé' },
    { value: 'delayed', label: 'Retardé' }
  ] as const;

  // Severity options
  const severityOptions = [
    { value: 'low', label: 'Faible' },
    { value: 'medium', label: 'Moyen' },
    { value: 'high', label: 'Élevé' },
    { value: 'critical', label: 'Critique' }
  ] as const;

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    const newFilters = {
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: new Date(value)
      }
    };
    onFiltersChange(newFilters);
  };

  const handleEventTypeToggle = (eventType: TimelineFiltersType['eventTypes'][0]) => {
    const newEventTypes = filters.eventTypes.includes(eventType)
      ? filters.eventTypes.filter(type => type !== eventType)
      : [...filters.eventTypes, eventType];
    
    onFiltersChange({
      ...filters,
      eventTypes: newEventTypes
    });
  };

  const handleVehicleToggle = (vehicleId: string) => {
    const newVehicleIds = filters.vehicleIds.includes(vehicleId)
      ? filters.vehicleIds.filter(id => id !== vehicleId)
      : [...filters.vehicleIds, vehicleId];
    
    onFiltersChange({
      ...filters,
      vehicleIds: newVehicleIds
    });
  };

  const handleStatusToggle = (status: TimelineFiltersType['statuses'][0]) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];
    
    onFiltersChange({
      ...filters,
      statuses: newStatuses
    });
  };

  const handleSeverityToggle = (severity: NonNullable<TimelineFiltersType['severity']>[0]) => {
    const currentSeverity = filters.severity || [];
    const newSeverity = currentSeverity.includes(severity)
      ? currentSeverity.filter(s => s !== severity)
      : [...currentSeverity, severity];
    
    onFiltersChange({
      ...filters,
      severity: newSeverity
    });
  };

  const handleReset = () => {
    const resetFilters: TimelineFiltersType = {
      dateRange: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        end: new Date()
      },
      eventTypes: [],
      vehicleIds: [],
      statuses: [],
      severity: []
    };
    onFiltersChange(resetFilters);
  };

  const getActiveFiltersCount = () => {
    return (
      filters.eventTypes.length +
      filters.vehicleIds.length +
      filters.statuses.length +
      (filters.severity?.length || 0)
    );
  };

  return (
    <div className={`timeline-filters bg-white rounded-lg shadow-sm border border-neutral-light ${className}`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        data-testid="filters-header"
      >
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-neutral-medium" />
          <h3 className="font-medium text-neutral-dark">Filtres</h3>
          {getActiveFiltersCount() > 0 && (
            <Badge 
              text={getActiveFiltersCount().toString()} 
              color="secondary"
            />
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {getActiveFiltersCount() > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
              data-testid="filters-reset"
            >
              <X className="w-4 h-4 mr-1" />
              Reset
            </Button>
          )}
          <ChevronDown 
            className={`w-5 h-5 text-neutral-medium transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {/* Filters Content */}
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="p-4 pt-0 space-y-6" data-testid="filters-content">
          {/* Date Range */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Calendar className="w-4 h-4 text-neutral-medium" />
              <label className="text-sm font-medium text-neutral-dark">
                Période
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-neutral-medium mb-1">Du</label>
                <input
                  type="date"
                  value={format(filters.dateRange.start, 'yyyy-MM-dd')}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-light rounded focus:outline-none focus:ring-2 focus:ring-primary-dark"
                  data-testid="date-start"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-medium mb-1">Au</label>
                <input
                  type="date"
                  value={format(filters.dateRange.end, 'yyyy-MM-dd')}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-light rounded focus:outline-none focus:ring-2 focus:ring-primary-dark"
                  data-testid="date-end"
                />
              </div>
            </div>
          </div>

          {/* Event Types */}
          <div>
            <label className="block text-sm font-medium text-neutral-dark mb-3">
              Types d'événements
            </label>
            <div className="flex flex-wrap gap-2">
              {eventTypeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = filters.eventTypes.includes(option.value);
                
                return (
                  <button
                    key={option.value}
                    onClick={() => handleEventTypeToggle(option.value)}
                    className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-full border transition-colors ${
                      isSelected
                        ? 'bg-primary-dark text-white border-primary-dark'
                        : 'bg-white text-neutral-dark border-neutral-light hover:bg-neutral-light'
                    }`}
                    data-testid={`event-type-${option.value}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vehicles */}
          <div>
            <label className="block text-sm font-medium text-neutral-dark mb-3">
              Véhicules
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {availableVehicles.map((vehicleId) => {
                const isSelected = filters.vehicleIds.includes(vehicleId);
                
                return (
                  <button
                    key={vehicleId}
                    onClick={() => handleVehicleToggle(vehicleId)}
                    className={`px-3 py-2 text-sm rounded-full border transition-colors ${
                      isSelected
                        ? 'bg-secondary-teal text-white border-secondary-teal'
                        : 'bg-white text-neutral-dark border-neutral-light hover:bg-neutral-light'
                    }`}
                    data-testid={`vehicle-${vehicleId}`}
                  >
                    {vehicleId}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-neutral-dark mb-3">
              Statuts
            </label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => {
                const isSelected = filters.statuses.includes(option.value);
                
                return (
                  <button
                    key={option.value}
                    onClick={() => handleStatusToggle(option.value)}
                    className={`px-3 py-2 text-sm rounded-full border transition-colors ${
                      isSelected
                        ? 'bg-primary-yellow text-neutral-dark border-primary-yellow'
                        : 'bg-white text-neutral-dark border-neutral-light hover:bg-neutral-light'
                    }`}
                    data-testid={`status-${option.value}`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-neutral-dark mb-3">
              Sévérité
            </label>
            <div className="flex flex-wrap gap-2">
              {severityOptions.map((option) => {
                const isSelected = filters.severity?.includes(option.value) || false;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSeverityToggle(option.value)}
                    className={`px-3 py-2 text-sm rounded-full border transition-colors ${
                      isSelected
                        ? 'bg-accent-orange text-white border-accent-orange'
                        : 'bg-white text-neutral-dark border-neutral-light hover:bg-neutral-light'
                    }`}
                    data-testid={`severity-${option.value}`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export { TimelineFilters };
