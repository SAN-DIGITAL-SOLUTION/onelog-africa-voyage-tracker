import React, { useState } from 'react';
import { 
  TimelineContainer, 
  TimelineFilters, 
  EventDetailModal,
  TimelineEvent,
  TimelineFilters as TimelineFiltersType
} from '../../components/timeline';
import { Layout } from '../../components/ui-system';
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

  return (
    <Layout>
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

          {/* Filters */}
          <div className="mb-6">
            <TimelineFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              availableVehicles={availableVehicles}
            />
          </div>

          {/* Error State */}
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

          {/* Timeline */}
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

              <TimelineContainer
                events={events}
                loading={loading}
                onEventClick={handleEventClick}
                height={600}
              />
            </div>
          </div>

          {/* Event Detail Modal */}
          <EventDetailModal
            event={selectedEvent}
            isOpen={isModalOpen}
            onClose={handleModalClose}
            onEdit={handleEventEdit}
          />
        </div>
      </div>
    </Layout>
  );
};

export default TimelinePage;
