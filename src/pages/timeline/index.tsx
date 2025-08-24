import React, { useState } from 'react';
import { 
  TimelineContainer, 
  TimelineFilters, 
  EventDetailModal,
  TimelineEvent,
  TimelineFilters as TimelineFiltersType
} from '../../components/timeline';
import { Section } from '../../components/ui-system';
import { useTimelineEvents } from '../../hooks/useTimelineEvents';
import { Clock, AlertCircle } from 'lucide-react';

const TimelinePage: React.FC = () => {
  const [filters, setFilters] = useState<TimelineFiltersType>({
    dateRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      end: new Date()
    },
    eventTypes: [],
    vehicleIds: [],
    statuses: [],
    severity: []
  });

  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { events, loading, error, refetch, availableVehicles } = useTimelineEvents(filters);

  const handleEventClick = (event: TimelineEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleEventEdit = (event: TimelineEvent) => {
    // TODO: Implement event editing
    console.log('Edit event:', event);
    setIsModalOpen(false);
  };

  const handleFiltersChange = (newFilters: TimelineFiltersType) => {
    setFilters(newFilters);
  };

  // Gestion du loading prolongé
  const [waitedLong, setWaitedLong] = React.useState(false);
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      timer = setTimeout(() => setWaitedLong(true), 5000);
    } else {
      setWaitedLong(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <Section>
      <div className="min-h-screen bg-neutral-light">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <Clock className="w-8 h-8 text-primary-dark" />
              <h1 className="text-3xl font-bold text-primary-dark">
                Timeline des Événements
              </h1>
            </div>
            <p className="text-neutral-medium">
              Analyse chronologique des trajets, incidents et opérations de votre flotte
            </p>
          </div>

          {/* Error State (affiché même pendant le loading) */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <h3 className="font-medium text-red-800">Erreur de chargement</h3>
                  <p className="text-sm text-red-600">{error}</p>
                  <button
                    onClick={refetch}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <span className="text-neutral-medium">Chargement...</span>
              {waitedLong && (
                <span className="ml-4 text-xs text-orange-500">Chargement inhabituellement long, vérifiez votre connexion ou contactez le support.</span>
              )}
            </div>
          )}

          {/* Filters */}
          {!loading && (
            <div className="mb-6">
              <TimelineFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                availableVehicles={availableVehicles}
              />
            </div>
          )}

          {/* Timeline ou état vide */}
          {!loading && !error && (
            <div className="bg-white rounded-lg shadow-sm border border-neutral-light">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-neutral-dark">
                    Événements récents
                  </h2>
                  <div className="text-sm text-neutral-medium">
                    {events.length} événement{events.length !== 1 ? 's' : ''} trouvé{events.length !== 1 ? 's' : ''}
                  </div>
                </div>

                {events.length === 0 ? (
                  <div className="text-center text-neutral-medium py-8">
                    Aucun événement trouvé pour la période sélectionnée.
                  </div>
                ) : (
                  <TimelineContainer
                    events={events}
                    loading={loading}
                    onEventClick={handleEventClick}
                    height={600}
                  />
                )}
              </div>
            </div>
          )}

          {/* Event Detail Modal */}
          <EventDetailModal
            event={selectedEvent}
            isOpen={isModalOpen}
            onClose={handleModalClose}
            onEdit={handleEventEdit}
          />
        </div>
      </div>
    </Section>
  );
};

export default TimelinePage;
