import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TimelineEvent } from '@/types/timeline';

const PAGE_SIZE = 20;

export const useTimelineData = (filters = {}) => {
  const queryClient = useQueryClient();

  const fetchTimelineEvents = async ({ pageParam = 0 }) => {
    let query = supabase
      .from('timeline_events')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1);

    // Appliquer les filtres
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        query = query.eq(key, value);
      }
    });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return {
      data: data as TimelineEvent[],
      nextPage: data.length === PAGE_SIZE ? pageParam + 1 : undefined,
      total: count || 0,
    };
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteQuery({
    queryKey: ['timelineEvents', filters],
    queryFn: fetchTimelineEvents,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });

  // Préchargement des données pour une navigation plus fluide
  const prefetchNextPage = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Invalider le cache et recharger les données
  const refreshData = async () => {
    await queryClient.invalidateQueries(['timelineEvents']);
  };

  // Aplatir les pages en une seule liste d'événements
  const events = data?.pages.flatMap((page) => page.data) || [];
  const total = data?.pages[0]?.total || 0;

  return {
    events,
    total,
    isLoading: status === 'loading',
    isError: status === 'error',
    error: error as Error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    prefetchNextPage,
    refreshData,
  };
};

// Hook pour la mise en cache optimisée
export const useTimelineCache = () => {
  const queryClient = useQueryClient();

  const prefetchEvent = async (eventId: string) => {
    await queryClient.prefetchQuery(
      ['timelineEvent', eventId],
      async () => {
        const { data, error } = await supabase
          .from('timeline_events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (error) throw error;
        return data;
      },
      { staleTime: 5 * 60 * 1000 } // 5 minutes
    );
  };

  return { prefetchEvent };
};

export default useTimelineData;
