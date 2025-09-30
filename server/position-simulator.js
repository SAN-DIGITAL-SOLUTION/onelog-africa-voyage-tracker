const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Données de simulation
const TRANSPORTEUR_ID = process.env.SIM_TRANSPORTEUR_ID || '00000000-0000-0000-0000-000000000000';
const VEHICULES = [
  { id: 'VH001', mission: 'MIS001', base: { lat: 5.359952, lng: -3.998575 } }, // Abidjan
  { id: 'VH002', mission: 'MIS002', base: { lat: 6.827622, lng: -5.289343 } }, // Bouaké
  { id: 'VH003', mission: 'MIS003', base: { lat: 4.760552, lng: -6.641273 } }, // San Pedro
  { id: 'VH004', mission: 'MIS004', base: { lat: 7.682846, lng: -5.017570 } }, // Korhogo
];

const STATUTS = ['en_route', 'en_attente', 'livre', 'retour'];

// Fonction pour générer une position aléatoire autour d'un point
function generateRandomPosition(base, radiusKm = 50) {
  const R = 6371; // Rayon de la Terre en km
  const d = radiusKm / R;
  const lat = base.lat * Math.PI / 180;
  const lng = base.lng * Math.PI / 180;
  
  const randomAngle = Math.random() * 2 * Math.PI;
  const randomDistance = Math.random() * d;
  
  const newLat = Math.asin(Math.sin(lat) * Math.cos(randomDistance) + 
    Math.cos(lat) * Math.sin(randomDistance) * Math.cos(randomAngle));
  const newLng = lng + Math.atan2(Math.sin(randomAngle) * Math.sin(randomDistance) * Math.cos(lat),
    Math.cos(randomDistance) - Math.sin(lat) * Math.sin(newLat));
  
  return {
    lat: newLat * 180 / Math.PI,
    lng: newLng * 180 / Math.PI
  };
}

// Fonction pour générer une vitesse réaliste
function generateSpeed() {
  return Math.floor(Math.random() * 120) + 20; // 20-140 km/h
}

// Fonction pour générer une direction
function generateDirection() {
  return Math.floor(Math.random() * 360);
}

// Fonction pour insérer une position
async function insertPosition(vehicule) {
  const position = generateRandomPosition(vehicule.base);
  const statut = STATUTS[Math.floor(Math.random() * STATUTS.length)];
  
  const positionData = {
    vehicule_id: vehicule.id,
    mission_id: vehicule.mission,
    transporteur_id: TRANSPORTEUR_ID,
    statut: statut,
    latitude: position.lat,
    longitude: position.lng,
    vitesse: generateSpeed(),
    direction: generateDirection()
  };

  try {
    const { data, error } = await supabase
      .from('positions')
      .insert([positionData])
      .select()
      .single();

    if (error) {
      console.error('Erreur insertion:', error);
    } else {
      console.log(`Position insérée: ${vehicule.id} - ${statut} - ${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`);
    }
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// Fonction pour nettoyer les anciennes positions
async function cleanupOldPositions() {
  const cutoffDate = new Date();
  cutoffDate.setHours(cutoffDate.getHours() - 24);

  try {
    const { error } = await supabase
      .from('positions')
      .delete()
      .lt('timestamp', cutoffDate.toISOString());

    if (error) {
      console.error('Erreur nettoyage:', error);
    } else {
      console.log('Anciennes positions nettoyées');
    }
  } catch (error) {
    console.error('Erreur nettoyage:', error);
  }
}

// Fonction principale de simulation
async function runSimulation() {
  console.log('🚀 Démarrage du simulateur de positions...');
  console.log(`Transporteur ID: ${TRANSPORTEUR_ID}`);
  console.log(`Véhicules: ${VEHICULES.map(v => v.id).join(', ')}`);
  
  // Nettoyer les anciennes positions au démarrage
  await cleanupOldPositions();
  
  // Insérer des positions initiales
  console.log('📍 Insertion des positions initiales...');
  for (const vehicule of VEHICULES) {
    await insertPosition(vehicule);
  }
  
  // Démarrer la boucle de simulation
  console.log('🔄 Démarrage de la boucle de mise à jour...');
  setInterval(async () => {
    const randomVehicule = VEHICULES[Math.floor(Math.random() * VEHICULES.length)];
    await insertPosition(randomVehicule);
  }, 5000); // Toutes les 5 secondes
  
  // Nettoyage toutes les heures
  setInterval(cleanupOldPositions, 3600000);
}

// Gestion des erreurs
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Démarrer la simulation
runSimulation().catch(console.error);
