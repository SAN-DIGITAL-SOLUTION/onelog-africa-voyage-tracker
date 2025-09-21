// K6 Stress Test - OneLog Africa Phase 2
// Test de montée en charge progressive 500 → 5000 utilisateurs

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Métriques personnalisées
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');
const requestCount = new Counter('requests');

// Configuration des scénarios de test
export const options = {
  scenarios: {
    // Scénario 1: Montée en charge progressive
    ramp_up: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },   // Montée à 100 utilisateurs
        { duration: '5m', target: 100 },   // Maintien 100 utilisateurs
        { duration: '2m', target: 500 },   // Montée à 500 utilisateurs
        { duration: '10m', target: 500 },  // Maintien 500 utilisateurs
        { duration: '3m', target: 1000 },  // Montée à 1000 utilisateurs
        { duration: '10m', target: 1000 }, // Maintien 1000 utilisateurs
        { duration: '5m', target: 2000 },  // Montée à 2000 utilisateurs
        { duration: '10m', target: 2000 }, // Maintien 2000 utilisateurs
        { duration: '5m', target: 5000 },  // Pic à 5000 utilisateurs
        { duration: '5m', target: 5000 },  // Maintien pic
        { duration: '5m', target: 0 },     // Descente progressive
      ],
    },
    
    // Scénario 2: Test de spike
    spike_test: {
      executor: 'ramping-vus',
      startTime: '60m',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 100 },
        { duration: '1m', target: 3000 },  // Spike soudain
        { duration: '30s', target: 100 },
      ],
    },
  },
  
  thresholds: {
    // Seuils de performance Phase 2
    http_req_duration: ['p(95)<1000'], // 95% des requêtes < 1s
    http_req_failed: ['rate<0.05'],    // Taux d'erreur < 5%
    errors: ['rate<0.05'],
    response_time: ['p(95)<1000'],
  },
};

// Configuration de base
const BASE_URL = 'http://localhost:5173';
const API_BASE = `${BASE_URL}/api`;

// Données de test
const TEST_USERS = [
  { email: 'test1@onelogafrica.com', password: 'TestUser123!' },
  { email: 'test2@onelogafrica.com', password: 'TestUser123!' },
  { email: 'chauffeur1@onelogafrica.com', password: 'Driver123!' },
  { email: 'exploitant1@onelogafrica.com', password: 'Manager123!' },
];

// Fonction principale de test
export default function () {
  const user = TEST_USERS[Math.floor(Math.random() * TEST_USERS.length)];
  
  // Test 1: Authentification
  testAuthentication(user);
  sleep(1);
  
  // Test 2: Récupération des missions
  testMissionsRetrieval();
  sleep(1);
  
  // Test 3: Mise à jour position GPS
  testGPSUpdate();
  sleep(1);
  
  // Test 4: Notifications
  testNotifications();
  sleep(2);
}

function testAuthentication(user) {
  const loginPayload = JSON.stringify({
    email: user.email,
    password: user.password,
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const response = http.post(`${API_BASE}/auth/login`, loginPayload, params);
  
  const success = check(response, {
    'login status is 200': (r) => r.status === 200,
    'login response time < 500ms': (r) => r.timings.duration < 500,
    'login returns token': (r) => r.json('access_token') !== undefined,
  });
  
  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  requestCount.add(1);
  
  return response.json('access_token');
}

function testMissionsRetrieval() {
  const response = http.get(`${API_BASE}/missions?limit=50`);
  
  const success = check(response, {
    'missions status is 200': (r) => r.status === 200,
    'missions response time < 300ms': (r) => r.timings.duration < 300,
    'missions returns array': (r) => Array.isArray(r.json()),
  });
  
  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  requestCount.add(1);
}

function testGPSUpdate() {
  const gpsPayload = JSON.stringify({
    mission_id: `mission_${Math.floor(Math.random() * 1000)}`,
    latitude: 5.3600 + (Math.random() - 0.5) * 0.1, // Abidjan ± variation
    longitude: -4.0083 + (Math.random() - 0.5) * 0.1,
    timestamp: new Date().toISOString(),
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const response = http.post(`${API_BASE}/tracking/position`, gpsPayload, params);
  
  const success = check(response, {
    'gps update status is 200 or 201': (r) => [200, 201].includes(r.status),
    'gps update response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  requestCount.add(1);
}

function testNotifications() {
  const response = http.get(`${API_BASE}/notifications?unread=true`);
  
  const success = check(response, {
    'notifications status is 200': (r) => r.status === 200,
    'notifications response time < 400ms': (r) => r.timings.duration < 400,
  });
  
  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  requestCount.add(1);
}

// Test de la page d'accueil
export function testHomePage() {
  const response = http.get(BASE_URL);
  
  check(response, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads in < 2s': (r) => r.timings.duration < 2000,
    'homepage contains OneLog': (r) => r.body.includes('OneLog'),
  });
}

// Test du dashboard TV
export function testTVDashboard() {
  const response = http.get(`${BASE_URL}/fullscreen-dashboard`);
  
  check(response, {
    'tv dashboard status is 200': (r) => r.status === 200,
    'tv dashboard loads in < 3s': (r) => r.timings.duration < 3000,
  });
}

// Fonction de setup (exécutée une fois au début)
export function setup() {
  console.log('🚀 Démarrage des tests de charge OneLog Africa Phase 2');
  console.log('📊 Objectif: Valider la performance jusqu\'à 5000 utilisateurs simultanés');
  
  // Test de connectivité initial
  const response = http.get(BASE_URL);
  if (response.status !== 200) {
    throw new Error(`Application non accessible: ${response.status}`);
  }
  
  return { timestamp: new Date().toISOString() };
}

// Fonction de teardown (exécutée une fois à la fin)
export function teardown(data) {
  console.log('✅ Tests de charge terminés');
  console.log(`📈 Démarré à: ${data.timestamp}`);
  console.log('📊 Vérifiez les métriques pour validation des KPI Phase 2');
}
