import React, { useState, useCallback } from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { TimelineOptimized } from '@/components/timeline/TimelineOptimized';
import { TimelineEvent as TimelineEventType } from '@/types/timeline';
import { EventDetailModal } from '@/components/timeline/EventDetailModal';
import { TimelineFiltersOptimized } from '@/components/timeline/TimelineFiltersOptimized';

const TimelinePageOptimized: React.FC = () => {
  // État pour la modale de détail d'événement
  const [selectedEvent, setSelectedEvent] = useState<TimelineEventType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Gestion du clic sur un événement
  const handleEventClick = useCallback((event: TimelineEventType) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  }, []);

  // Gestion de la fermeture de la modale
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  }, []);

  // Gestion de l'édition d'événement
  const handleEventEdit = useCallback((event: TimelineEventType) => {
    console.log('Edit event:', event);
    // TODO: Implémenter la logique d'édition
    setIsModalOpen(false);
  }, []);

  // Set the page title
  React.useEffect(() => {
    document.title = 'Timeline des Événements | OneLog Africa';
  }, []);

  return (
    <section data-testid="timeline-page">
      <div className="min-h-screen bg-neutral-light">
        <div className="container mx-auto px-4 py-8">
          {/* En-tête */}
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

          {/* Filtres optimisés */}
          <div className="mb-6">
            <TimelineFiltersOptimized />
          </div>

          {/* Timeline optimisée */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-light">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-neutral-dark">
                  Événements récents
                </h2>
              </div>
              
              <TimelineOptimized 
                onEventClick={handleEventClick}
                height={600}
                className="mt-4"
                data-testid="timeline-container"
              />
            </div>
          </div>

          {/* Modale de détail d'événement */}
          <EventDetailModal
            event={selectedEvent}
            isOpen={isModalOpen}
            onClose={handleModalClose}
            onEdit={handleEventEdit}
          />
        </div>
      </div>
    </section>
  );
};

export default TimelinePageOptimized;
