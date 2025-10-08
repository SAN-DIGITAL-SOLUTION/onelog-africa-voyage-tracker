import { useState, useEffect, useCallback } from 'react';
import { TimelineEvent, TimelineFilters } from '../components/timeline/types';
import { timelineService } from '../services/TimelineService';

interface UseTimelineEventsReturn {
  events: TimelineEvent[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  availableVehicles: string[];
}

export const useTimelineEvents = (filters?: Partial<TimelineFilters>): UseTimelineEventsReturn => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableVehicles, setAvailableVehicles] = useState<string[]>([]);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [eventsData, vehiclesData] = await Promise.all([
        timelineService.getEvents(filters),
        timelineService.getAvailableVehicles()
      ]);
      
      setEvents(eventsData);
      setAvailableVehicles(vehiclesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      console.error('Error fetching timeline events:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(async () => {
    await fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    refetch,
    availableVehicles
  };
};
