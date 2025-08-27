import React, { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTimelineData } from '@/hooks/useTimelineData';
import { TimelineFiltersOptimized } from './TimelineFiltersOptimized';
import { TimelineEvent as TimelineEventType } from '@/types/timeline';
import { EventItem } from './EventItem';
import { DayDivider } from './DayDivider';
import { Loader2, AlertCircle } from 'lucide-react';

// Composant d'élément de timeline virtuel
const TimelineItem = React.memo(({ item, onEventClick }: {
  item: { type: 'divider' | 'event', date?: Date, event?: TimelineEventType, eventCount?: number };
  onEventClick?: (event: TimelineEventType) => void;
}) => {
  if (item.type === 'divider' && item.date) {
    return (
      <DayDivider 
        date={item.date} 
        eventCount={item.eventCount} 
        className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm"
      />
    );
  }
  
  if (item.type === 'event' && item.event) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className="py-2"
      >
        <EventItem 
          event={item.event} 
          onClick={() => onEventClick?.(item.event!)} 
          className="hover:shadow-md transition-shadow"
        />
      </motion.div>
    );
  }
  
  return null;
});

TimelineItem.displayName = 'TimelineItem';

// Composant principal TimelineOptimized
const TimelineOptimized: React.FC<{
  className?: string;
  onEventClick?: (event: TimelineEventType) => void;
  height?: number | string;
}> = ({ 
  className = '',
  onEventClick,
  height = 'calc(100vh - 250px)',
}) => {
  // État local pour le chargement
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Récupération des données avec le hook personnalisé
  const {
    events,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTimelineData({});

  // Gestion du clic sur un événement
  const handleEventClick = useCallback((event: TimelineEventType) => {
    onEventClick?.(event);
  }, [onEventClick]);

  // Gestion du défilement infini
  const handleLoadMore = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Gestion des filtres
  const handleFiltersChange = useCallback((filters: any) => {
    // Les filtres sont déjà gérés par le hook useTimelineData via l'URL
    console.log('Filters changed:', filters);
  }, []);

  // Regroupement des événements par jour pour le rendu
  const timelineItems = useMemo(() => {
    if (!events || events.length === 0) return [];

    const sortedEvents = [...events].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const items: Array<{
      type: 'divider' | 'event';
      date?: Date;
      event?: TimelineEventType;
      eventCount?: number;
    }> = [];

    let currentDate: Date | null = null;
    let currentDayEvents: TimelineEventType[] = [];

    sortedEvents.forEach((event) => {
      const eventDate = new Date(event.timestamp);
      
      if (!currentDate || !isSameDay(eventDate, currentDate)) {
        // Ajouter le séparateur du jour précédent s'il y a des événements
        if (currentDate && currentDayEvents.length > 0) {
          items.push({
            type: 'divider',
            date: currentDate,
            eventCount: currentDayEvents.length
          });
          
          // Ajouter les événements du jour précédent
          currentDayEvents.forEach(evt => {
            items.push({ type: 'event', event: evt });
          });
          
          currentDayEvents = [];
        }
        
        currentDate = eventDate;
      }
      
      currentDayEvents.push(event);
    });

    // Ajouter le dernier jour
    if (currentDate && currentDayEvents.length > 0) {
      items.push({
        type: 'divider',
        date: currentDate,
        eventCount: currentDayEvents.length
      });
      
      currentDayEvents.forEach(evt => {
        items.push({ type: 'event', event: evt });
      });
    }

    return items;
  }, [events]);

  // Effet pour gérer le chargement initial
  React.useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Affichage du chargement initial
  if (isInitialLoad) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center justify-center h-64" data-testid="loading-indicator">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-4" />
          <p className="text-neutral-600">Chargement des événements...</p>
        </div>
      </div>
    );
  }

  // Gestion des erreurs
  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Erreur lors du chargement des données : {error?.message}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-full ${className}`} data-testid="timeline-container">
      {/* En-tête avec filtres */}
      <div className="mb-4">
        <TimelineFiltersOptimized 
          onChange={handleFiltersChange} 
          data-testid="timeline-filters"
        />
      </div>

      {/* Conteneur de la timeline avec défilement */}
      <div 
        className="relative overflow-y-auto pr-2" 
        style={{ height }}
        data-testid="event-list"
        onScroll={(e) => {
          const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
          // Charger plus d'éléments lorsque l'utilisateur fait défiler vers le bas
          if (scrollHeight - scrollTop <= clientHeight * 1.5 && !isFetchingNextPage && hasNextPage) {
            handleLoadMore();
          }
        }}
      >
        {isLoading && isInitialLoad ? (
          <div className="flex flex-col items-center justify-center h-64 text-neutral-500" data-testid="loading-message">
            <p>Chargement des événements...</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {timelineItems.map((item, index) => (
              <TimelineItem 
                key={`${item.type}-${item.event?.id || item.date?.toISOString()}`}
                item={item}
                onEventClick={handleEventClick}
                data-testid={item.event ? `event-item-${item.event.id}` : undefined}
              />
            ))}
          </AnimatePresence>
        )}
        
        {!isLoading && timelineItems.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-neutral-500" data-testid="no-events-message">
            <p>Aucun événement à afficher</p>
          </div>
        )}

        {/* Chargement de plus de données */}
        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        )}

        {/* Détecteur de défilement pour le chargement infini */}
        {hasNextPage && !isFetchingNextPage && (
          <div 
            ref={(node) => {
              if (node) {
                const observer = new IntersectionObserver(
                  (entries) => {
                    if (entries[0].isIntersecting) {
                      handleLoadMore();
                    }
                  },
                  { threshold: 0.1 }
                );
                
                observer.observe(node);
                return () => observer.disconnect();
              }
            }}
            className="h-1"
          />
        )}
      </div>
    </div>
  );
};

export { TimelineOptimized };

// Types pour les props
declare global {
  interface Window {
    TimelineOptimized: typeof TimelineOptimized;
  }
}

// Exposer le composant globalement pour le débogage
if (typeof window !== 'undefined') {
  window.TimelineOptimized = TimelineOptimized;
}
