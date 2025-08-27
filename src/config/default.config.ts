/**
 * Configuration par défaut de OneLog Africa - Système Mapbox
 * Ce fichier garantit que Mapbox est le système de cartographie par défaut
 * et fournit une configuration centralisée pour toute l'application
 */

import { MAPBOX_CONFIG } from './mapbox.config';

// Configuration système par défaut
export const SYSTEM_CONFIG = {
  // Système de cartographie par défaut
  mapSystem: 'mapbox' as const,
  
  // Configuration Mapbox (système par défaut)
  mapbox: MAPBOX_CONFIG,
  
  // Configuration tracking temps réel
  realtime: {
    updateInterval: 3000, // 3 secondes
    maxPositions: 1000,
    cleanupInterval: 300000, // 5 minutes
  },
  
  // Configuration affichage
  display: {
    defaultCenter: MAPBOX_CONFIG.defaultCenter,
    defaultZoom: MAPBOX_CONFIG.defaultZoom,
    fullscreenEnabled: true,
    controlsEnabled: true,
  },
  
  // Configuration API
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
    endpoints: {
      positions: '/positions',
      latest: '/positions/latest',
      update: '/positions/update',
    }
  }
} as const;

// Vérification de la configuration système
export const validateSystemConfig = (): boolean => {
  const isMapboxConfigured = !!MAPBOX_CONFIG.accessToken;
  
  if (!isMapboxConfigured) {
    console.warn('⚠️ Configuration Mapbox incomplète. Vérifiez votre fichier .env');
    console.info('💡 Variables requises: VITE_MAPBOX_ACCESS_TOKEN');
    return false;
  }
  
  console.log('✅ Configuration Mapbox système par défaut activée');
  return true;
};

// Export de la configuration par défaut
export default SYSTEM_CONFIG;
