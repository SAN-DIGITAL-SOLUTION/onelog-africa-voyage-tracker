import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { EventItem } from './EventItem';
import { DayDivider } from './DayDivider';
import { TimelineContainerProps } from './types';
import { Loader2 } from 'lucide-react';

const TimelineContainer: React.FC<TimelineContainerProps> = ({
  events,
  loading = false,
  onEventClick,
  height = 600,
  className = ''
}) => {
  // Group events by day
  const timelineItems = useMemo(() => {
    if (!events || events.length === 0) return [];

    const sortedEvents = [...events].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const items: Array<{
      type: 'divider' | 'event';
      date?: Date;
      event?: typeof events[0];
      eventCount?: number;
    }> = [];

    let currentDate: Date | null = null;
    let currentDayEvents: typeof events = [];

    sortedEvents.forEach((event, index) => {
      const eventDate = new Date(event.timestamp);
      
      if (!currentDate || !isSameDay(eventDate, currentDate)) {
        // Add previous day's divider if we have events
        if (currentDate && currentDayEvents.length > 0) {
          items.push({
            type: 'divider',
            date: currentDate,
            eventCount: currentDayEvents.length
          });
          
          // Add previous day's events
          currentDayEvents.forEach(evt => {
            items.push({ type: 'event', event: evt });
          });
        }
        
        currentDate = eventDate;
        currentDayEvents = [event];
      } else {
        currentDayEvents.push(event);
      }
      
      // Handle last day
      if (index === sortedEvents.length - 1) {
        items.push({
          type: 'divider',
          date: currentDate,
          eventCount: currentDayEvents.length
        });
        
        currentDayEvents.forEach(evt => {
          items.push({ type: 'event', event: evt });
        });
      }
    });

    return items;
  }, [events]);

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-4 p-4">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-neutral-light rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-neutral-light rounded w-3/4"></div>
              <div className="h-3 bg-neutral-light rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Empty state
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-64 text-neutral-medium">
      <div className="w-16 h-16 bg-neutral-light rounded-full flex items-center justify-center mb-4">
        <Loader2 className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-medium mb-2">Aucun événement trouvé</h3>
      <p className="text-sm text-center max-w-md">
        Aucun événement ne correspond aux filtres sélectionnés. 
        Essayez de modifier vos critères de recherche.
      </p>
    </div>
  );

  if (loading) {
    return (
      <div 
        className={`timeline-container ${className}`}
        style={{ height: `${height}px` }}
        data-testid="timeline-container"
      >
        <LoadingSkeleton />
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div 
        className={`timeline-container ${className}`}
        style={{ height: `${height}px` }}
        data-testid="timeline-container"
      >
        <EmptyState />
      </div>
    );
  }

  return (
    <div 
      className={`timeline-container relative ${className}`}
      data-testid="timeline-container"
    >
      <div
        className="h-full overflow-auto scrollbar-thin scrollbar-thumb-neutral-medium scrollbar-track-neutral-light"
        style={{ height: `${height}px` }}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          className="space-y-4 p-4"
        >
          {timelineItems.map((item, index) => (
            <motion.div
              key={`${item.type}-${index}`}
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 }
              }}
            >
              {item.type === 'divider' ? (
                <DayDivider
                  date={item.date!}
                  eventCount={item.eventCount}
                  className="mb-4"
                />
              ) : (
                <EventItem
                  event={item.event!}
                  onClick={() => onEventClick?.(item.event!)}
                  className="mb-3"
                />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      {/* Timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-neutral-light"></div>
    </div>
  );
};

export { TimelineContainer };
