import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Métriques personnalisées
const errorRate = new Rate('errors');
const apiResponseTime = new Trend('api_response_time');

// Configuration des tests
export const options = {
  stages: [
    { duration: '2m', target: 10 },   // Montée progressive
    { duration: '5m', target: 50 },   // Charge normale
    { duration: '2m', target: 100 },  // Pic de charge
    { duration: '5m', target: 100 },  // Maintien du pic
    { duration: '2m', target: 0 },    // Descente
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% des requêtes < 2s
    http_req_failed: ['rate<0.05'],    // Taux d'erreur < 5%
    errors: ['rate<0.1'],              // Erreurs métier < 10%
  },
};

const SUPABASE_URL = __ENV.SUPABASE_URL;
const PHP_URL = __ENV.PHP_URL;
const ANON_KEY = __ENV.SUPABASE_ANON_KEY;

// Données de test
const testUsers = [
  { email: 'client1@test.com', password: 'test123' },
  { email: 'chauffeur1@test.com', password: 'test123' },
  { email: 'admin1@test.com', password: 'test123' },
];

const testMissions = [
  {
    client_name: 'Test Client',
    pickup_location: 'Dakar Centre',
    destination: 'Aéroport Dakar',
    scheduled_time: new Date(Date.now() + 3600000).toISOString(),
  },
];

export function setup() {
  const authTokens = {};

  testUsers.forEach(user => {
    const res = http.post(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      email: user.email,
      password: user.password,
    }, {
      headers: { 'apikey': ANON_KEY }
    });

    if (res.status === 200) {
      authTokens[user.email] = res.json('access_token');
    } else {
      console.error(`Failed to authenticate user ${user.email}: ${res.status} ${res.body}`);
    }
  });

  return { authTokens };
}

export default function(data) {
  const scenarios = [
    () => testHomePage(),
    () => testAuthentication(),
    () => testMissionsList(data.authTokens),
    () => testMissionCreation(data.authTokens),
    () => testTrackingUpdates(data.authTokens),
    () => testNotifications(data.authTokens),
    () => testAdminDashboard(data.authTokens),
  ];
  
  // Exécuter un scénario aléatoire
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  scenario();
  
  sleep(1);
}

function testHomePage() {
  const res = http.get(`${PHP_URL}/`);
  
  check(res, {
    'Homepage loads': (r) => r.status === 200,
    'Homepage contains title': (r) => r.body.includes('OneLog Africa'),
    'Response time < 1s': (r) => r.timings.duration < 1000,
  });
  
  errorRate.add(res.status !== 200);
  apiResponseTime.add(res.timings.duration);
}

function testAuthentication() {
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];
  
  const res = http.post(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    email: user.email,
    password: user.password,
  });
  
  check(res, {
    'Login successful': (r) => r.status === 200,
    'Token received': (r) => r.json('access_token') !== undefined,
    'Login time < 500ms': (r) => r.timings.duration < 500,
  });
  
  errorRate.add(res.status !== 200);
  apiResponseTime.add(res.timings.duration);
}

function testMissionsList(authTokens) {
  const token = Object.values(authTokens)[0];
  if (!token) return;
  
  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  
  const res = http.get(`${SUPABASE_URL}/rest/v1/missions?select=*`, params);
  
  check(res, {
    'Missions list loads': (r) => r.status === 200,
    'Response is JSON': (r) => r.headers['Content-Type'].includes('application/json'),
    'Contains missions array': (r) => Array.isArray(r.json('data')),
    'List time < 1s': (r) => r.timings.duration < 1000,
  });
  
  errorRate.add(res.status !== 200);
  apiResponseTime.add(res.timings.duration);
}

function testMissionCreation(authTokens) {
  const token = authTokens['client1@test.com'];
  if (!token) return;
  
  const mission = testMissions[0];
  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  
  const res = http.post(`${SUPABASE_URL}/rest/v1/missions`, JSON.stringify(mission), params);
  
  check(res, {
    'Mission created': (r) => r.status === 201,
    'Mission ID returned': (r) => r.json('id') !== undefined,
    'Creation time < 2s': (r) => r.timings.duration < 2000,
  });
  
  errorRate.add(res.status !== 201);
  apiResponseTime.add(res.timings.duration);
}

function testTrackingUpdates(authTokens) {
  const token = authTokens['chauffeur1@test.com'];
  if (!token) return;
  
  const trackingData = {
    mission_id: 'test-mission-id',
    latitude: 14.6928 + (Math.random() - 0.5) * 0.01,
    longitude: -17.4467 + (Math.random() - 0.5) * 0.01,
    accuracy: Math.random() * 10 + 5,
    timestamp: new Date().toISOString(),
  };
  
  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  
  const res = http.post(`${PHP_URL}/log_position.php`, trackingData, { headers: { 'Authorization': `Bearer ${token}` } });
  
  check(res, {
    'Tracking updated': (r) => r.status === 200,
    'Update time < 500ms': (r) => r.timings.duration < 500,
  });
  
  errorRate.add(res.status !== 200);
  apiResponseTime.add(res.timings.duration);
}

function testNotifications(authTokens) {
  const token = Object.values(authTokens)[0];
  if (!token) return;
  
  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  
  const res = http.get(`${SUPABASE_URL}/rest/v1/notifications?select=*`, params);
  
  check(res, {
    'Notifications loaded': (r) => r.status === 200,
    'Response time < 800ms': (r) => r.timings.duration < 800,
  });
  
  errorRate.add(res.status !== 200);
  apiResponseTime.add(res.timings.duration);
}

function testAdminDashboard(authTokens) {
  const token = authTokens['admin1@test.com'];
  if (!token) return;
  
  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  
  const endpoints = [
    '/api/admin/stats',
    '/api/admin/users',
    '/api/admin/missions/summary',
  ];
  
  endpoints.forEach(endpoint => {
    const res = http.get(`${SUPABASE_URL}/rest/v1${endpoint}`, params);
    
    check(res, {
      [`${endpoint} loads`]: (r) => r.status === 200,
      [`${endpoint} time < 1.5s`]: (r) => r.timings.duration < 1500,
    });
    
    errorRate.add(res.status !== 200);
    apiResponseTime.add(res.timings.duration);
  });
}

export function teardown(data) {
  // Nettoyage des données de test si nécessaire
  console.log('Test de charge terminé');
}
