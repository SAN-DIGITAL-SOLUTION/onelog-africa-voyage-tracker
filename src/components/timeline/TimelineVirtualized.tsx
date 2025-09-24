import React from 'react';
import { useVirtual } from '@tanstack/react-virtual';
import { TimelineEvent as TimelineEventType } from '@/types/timeline';
import TimelineEvent from './TimelineEvent';

interface TimelineVirtualizedProps {
  events: TimelineEventType[];
  loading?: boolean;
  onLoadMore?: () => void;
}

const TimelineVirtualized: React.FC<TimelineVirtualizedProps> = ({
  events,
  loading = false,
  onLoadMore,
}) => {
  const parentRef = React.useRef<HTMLDivElement>(null);
  const loaderRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtual({
    size: events.length,
    parentRef,
    estimateSize: React.useCallback(() => 120, []), // Hauteur estimée d'un élément
    overscan: 5, // Nombre d'éléments à précharger
  });

  // Observer pour le chargement infini
  React.useEffect(() => {
    if (!onLoadMore || !loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [onLoadMore]);

  return (
    <div className="timeline-virtualized">
      <div
        ref={parentRef}
        className="timeline-container"
        style={{
          height: '600px',
          width: '100%',
          overflow: 'auto',
          position: 'relative',
        }}
      >
        <div
          style={{
            height: `${rowVirtualizer.totalSize}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.virtualItems.map((virtualRow) => {
            const event = events[virtualRow.index];
            return (
              <div
                key={virtualRow.index}
                ref={virtualRow.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="timeline-row"
              >
                <TimelineEvent event={event} />
              </div>
            );
          })}
        </div>
        
        {/* Loader pour le chargement infini */}
        {loading && (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {/* Élément déclencheur pour le chargement infini */}
        <div ref={loaderRef} style={{ height: '20px' }} />
      </div>
    </div>
  );
};

export default React.memo(TimelineVirtualized);
