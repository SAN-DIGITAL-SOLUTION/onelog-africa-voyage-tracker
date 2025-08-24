import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDebounce } from 'use-debounce';

type TimelineFilters = {
  type?: string;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: string | undefined;
};

export const useTimelineFilters = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extraire les filtres de l'URL
  const getFiltersFromUrl = useCallback((): TimelineFilters => {
    const searchParams = new URLSearchParams(location.search);
    return {
      type: searchParams.get('type') || '',
      status: searchParams.get('status') || '',
      search: searchParams.get('search') || '',
      startDate: searchParams.get('startDate') || '',
      endDate: searchParams.get('endDate') || '',
    };
  }, [location.search]);

  const [filters, setFilters] = useState<TimelineFilters>(getFiltersFromUrl());
  const [debouncedFilters] = useDebounce(filters, 500);

  // Mettre à jour l'URL lorsque les filtres changent
  useEffect(() => {
    const searchParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value);
      } else {
        searchParams.delete(key);
      }
    });

    navigate(
      {
        pathname: location.pathname,
        search: searchParams.toString(),
      },
      { replace: true }
    );
  }, [filters, location.pathname, navigate]);

  // Mettre à jour les filtres lorsque l'URL change (navigation arrière/avant)
  useEffect(() => {
    setFilters(getFiltersFromUrl());
  }, [getFiltersFromUrl, location.search]);

  const updateFilter = useCallback((key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Sauvegarder les préférences de filtre dans localStorage
  const saveFilterPreset = useCallback((name: string) => {
    const presets = JSON.parse(localStorage.getItem('timelineFilterPresets') || '{}');
    presets[name] = filters;
    localStorage.setItem('timelineFilterPresets', JSON.stringify(presets));
  }, [filters]);

  // Charger des préférences de filtre depuis localStorage
  const loadFilterPreset = useCallback((name: string) => {
    const presets = JSON.parse(localStorage.getItem('timelineFilterPresets') || '{}');
    if (presets[name]) {
      setFilters(presets[name]);
      return true;
    }
    return false;
  }, []);

  return {
    filters: debouncedFilters,
    updateFilter,
    resetFilters,
    saveFilterPreset,
    loadFilterPreset,
  };
};

export default useTimelineFilters;
