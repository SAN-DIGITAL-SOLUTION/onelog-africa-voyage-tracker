// Simulateur de véhicule pour démo OneLog Africa
// Ce script envoie des positions simulées au backend

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_URL = 'http://localhost:4000/positions/update';
const VEHICLE_ID = 'truck-demo-1';

// Coordonnées de base autour d'Abidjan
const baseLat = 5.356;
const baseLng = -4.0083;

// Trajets prédéfinis pour simulation réaliste
const routes = [
  { lat: 5.3560, lng: -4.0083, name: 'Plateau' },
  { lat: 5.3600, lng: -4.0100, name: 'Cocody' },
  { lat: 5.3500, lng: -4.0050, name: 'Marcory' },
  { lat: 5.3650, lng: -4.0150, name: 'Yopougon' },
  { lat: 5.3400, lng: -4.0020, name: 'Treichville' }
];

let currentRouteIndex = 0;
let currentStep = 0;

function generateRealisticPosition() {
  // Simulation de déplacement entre points
  const from = routes[currentRouteIndex];
  const to = routes[(currentRouteIndex + 1) % routes.length];
  
  const progress = (currentStep % 20) / 20; // 20 étapes entre chaque point
  
  const lat = from.lat + (to.lat - from.lat) * progress;
  const lng = from.lng + (to.lng - from.lng) * progress;
  
  // Ajouter un peu de bruit réaliste
  const noisyLat = lat + (Math.random() - 0.5) * 0.001;
  const noisyLng = lng + (Math.random() - 0.5) * 0.001;
  
  currentStep++;
  if (currentStep % 20 === 0) {
    currentRouteIndex = (currentRouteIndex + 1) % routes.length;
  }
  
  return {
    latitude: noisyLat,
    longitude: noisyLng,
    location: routes[currentRouteIndex].name
  };
}

async function sendPosition() {
  try {
    const position = generateRealisticPosition();
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        vehicle_id: VEHICLE_ID,
        latitude: position.latitude,
        longitude: position.longitude
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Position envoyée: ${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)} (${position.location})`);
    
  } catch (error) {
    console.error(`❌ Erreur d'envoi: ${error.message}`);
  }
}

// Fonction pour arrêter le simulateur proprement
function stopSimulator() {
  console.log('🛑 Simulateur arrêté');
  process.exit(0);
}

// Gestion des signaux d'arrêt
process.on('SIGINT', stopSimulator);
process.on('SIGTERM', stopSimulator);

// Démarrer le simulateur
console.log('🚀 Simulateur OneLog Africa démarré');
console.log(`📍 Véhicule: ${VEHICLE_ID}`);
console.log(`🔄 Envoi toutes les 10 secondes`);
console.log('📍 Trajet: Plateau → Cocody → Marcory → Yopougon → Treichville → Plateau');

// Envoyer immédiatement une première position
sendPosition();

// Puis envoyer toutes les 10 secondes
const interval = setInterval(sendPosition, 10000);

// Option: ajouter un second véhicule après 5 secondes
setTimeout(() => {
  const secondVehicle = setInterval(async () => {
    const lat = 5.356 + (Math.random() - 0.5) * 0.02;
    const lng = -4.0083 + (Math.random() - 0.5) * 0.02;
    
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicle_id: 'truck-demo-2',
        latitude: lat,
        longitude: lng
      }),
    });
    
    console.log(`✅ Position truck-demo-2: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
  }, 15000);
}, 5000);

module.exports = { sendPosition };
