import { useState, useEffect, useRef } from 'react';
import { useControlRoom } from './useControlRoom';

interface OfflineFallbackOptions {
  pollingInterval?: number;
  retryInterval?: number;
  maxRetries?: number;
  offlineThreshold?: number;
}

interface ConnectionStatus {
  isOnline: boolean;
  isRealtimeConnected: boolean;
  lastSync: Date | null;
  retryCount: number;
}

export const useOfflineFallback = (
  transporteurId: string,
  options: OfflineFallbackOptions = {}
) => {
  const {
    pollingInterval = 5000,
    retryInterval = 3000,
    maxRetries = 5,
    offlineThreshold = 10000
  } = options;

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isOnline: navigator.onLine,
    isRealtimeConnected: true,
    lastSync: null,
    retryCount: 0
  });

  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastRealtimeActivityRef = useRef<number>(Date.now());

  const { positions, refetch, isLoading, error } = useControlRoom(transporteurId);

  // Monitor network connectivity
  useEffect(() => {
    const handleOnline = () => {
      setConnectionStatus(prev => ({ ...prev, isOnline: true }));
      setIsFallbackMode(false);
      stopPolling();
    };

    const handleOffline = () => {
      setConnectionStatus(prev => ({ ...prev, isOnline: false }));
      setIsFallbackMode(true);
      startPolling();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitor WebSocket connection
  useEffect(() => {
    const checkRealtimeConnection = () => {
      const timeSinceLastActivity = Date.now() - lastRealtimeActivityRef.current;
      
      if (timeSinceLastActivity > offlineThreshold) {
        setConnectionStatus(prev => ({ 
          ...prev, 
          isRealtimeConnected: false 
        }));
        setIsFallbackMode(true);
        startPolling();
      } else {
        setConnectionStatus(prev => ({ 
          ...prev, 
          isRealtimeConnected: true 
        }));
      }
    };

    const interval = setInterval(checkRealtimeConnection, 1000);
    return () => clearInterval(interval);
  }, [offlineThreshold]);

  // Start polling for data
  const startPolling = () => {
    if (pollingIntervalRef.current) return;

    pollingIntervalRef.current = setInterval(async () => {
      try {
        await refetch();
        setConnectionStatus(prev => ({ 
          ...prev, 
          lastSync: new Date(),
          retryCount: 0
        }));
      } catch (error) {
        handlePollingError(error);
      }
    }, pollingInterval);
  };

  // Stop polling
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (retryIntervalRef.current) {
      clearInterval(retryIntervalRef.current);
      retryIntervalRef.current = null;
    }
  };

  // Handle polling errors
  const handlePollingError = (error: any) => {
    setConnectionStatus(prev => ({ 
      ...prev, 
      retryCount: prev.retryCount + 1 
    }));

    if (connectionStatus.retryCount >= maxRetries) {
      logger.error('Max retries reached, stopping polling', error);
      stopPolling();
      return;
    }

    // Exponential backoff for retries
    const delay = retryInterval * Math.pow(2, connectionStatus.retryCount - 1);
    retryIntervalRef.current = setTimeout(() => {
      startPolling();
    }, Math.min(delay, 30000)); // Max 30 seconds
  };

  // Update realtime activity timestamp
  const updateRealtimeActivity = () => {
    lastRealtimeActivityRef.current = Date.now();
    setConnectionStatus(prev => ({ 
      ...prev, 
      isRealtimeConnected: true,
      lastSync: new Date()
    }));
    
    if (isFallbackMode) {
      setIsFallbackMode(false);
      stopPolling();
    }
  };

  // Exponential backoff for connection recovery
  const attemptReconnection = async () => {
    setConnectionStatus(prev => ({ 
      ...prev, 
      retryCount: prev.retryCount + 1 
    }));

    try {
      await refetch();
      updateRealtimeActivity();
      return true;
    } catch (error) {
      logger.warn('Reconnection attempt failed', { 
        attempt: connectionStatus.retryCount, 
        error 
      });
      return false;
    }
  };

  // Manual sync trigger
  const forceSync = async () => {
    try {
      await refetch();
      updateRealtimeActivity();
      return true;
    } catch (error) {
      logger.error('Force sync failed', error);
      return false;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  // Logger utility
  const logger = {
    info: (message: string, data?: any) => {
      console.log(`[OfflineFallback] ${message}`, data);
    },
    warn: (message: string, data?: any) => {
      console.warn(`[OfflineFallback] ${message}`, data);
    },
    error: (message: string, error?: any) => {
      console.error(`[OfflineFallback] ${message}`, error);
    }
  };

  return {
    positions,
    isLoading,
    error,
    connectionStatus,
    isFallbackMode,
    forceSync,
    attemptReconnection,
    updateRealtimeActivity,
    startPolling,
    stopPolling
  };
};

// Hook to use with existing ControlRoom component
export const useOfflineAwareControlRoom = (transporteurId: string) => {
  const offlineFallback = useOfflineFallback(transporteurId);
  const { positions, isLoading, error } = offlineFallback;

  return {
    positions,
    isLoading,
    error,
    ...offlineFallback
  };
};
