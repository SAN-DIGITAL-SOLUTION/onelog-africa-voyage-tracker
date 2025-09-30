/**
 * Configuration Mapbox par défaut pour OneLog Africa
 * Ce fichier centralise la configuration Mapbox et assure son utilisation comme système par défaut
 */

// Configuration Mapbox par défaut
export const MAPBOX_CONFIG = {
  // Token Mapbox - À remplacer par votre token réel
  accessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbGV4YW1wbGUwMG9hM3Jtb2w0Z3NqZ3JlIn0.123456789',
  
  // Style de carte par défaut
  style: import.meta.env.VITE_MAPBOX_STYLE || 'mapbox://styles/mapbox/streets-v11',
  
  // Coordonnées par défaut (Abidjan, Côte d'Ivoire)
  defaultCenter: {
    lat: 5.356,
    lng: -4.0083
  },
  
  // Zoom par défaut
  defaultZoom: 12,
  
  // Options de performance
  performanceOptions: {
    failIfMajorPerformanceCaveat: false,
    preserveDrawingBuffer: true,
    antialias: true
  },
  
  // Styles disponibles
  availableStyles: {
    streets: 'mapbox://styles/mapbox/streets-v11',
    outdoors: 'mapbox://styles/mapbox/outdoors-v11',
    light: 'mapbox://styles/mapbox/light-v10',
    dark: 'mapbox://styles/mapbox/dark-v10',
    satellite: 'mapbox://styles/mapbox/satellite-v9',
    satelliteStreets: 'mapbox://styles/mapbox/satellite-streets-v11'
  }
} as const;

// Vérification de la configuration
export const validateMapboxConfig = (): boolean => {
  const hasToken = !!import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  
  if (!hasToken) {
    console.warn('⚠️ VITE_MAPBOX_ACCESS_TOKEN non configuré. Utilisation du token de démonstration.');
    console.info('💡 Pour configurer votre token: Ajoutez VITE_MAPBOX_ACCESS_TOKEN dans votre fichier .env');
  }
  
  return hasToken;
};

// Export de la configuration par défaut
export default MAPBOX_CONFIG;
