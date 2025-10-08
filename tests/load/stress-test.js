import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Métriques pour test de stress
const errorRate = new Rate('stress_errors');
const responseTime = new Trend('stress_response_time');
const requestCount = new Counter('stress_requests');

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Montée rapide
    { duration: '3m', target: 200 },  // Stress élevé
    { duration: '1m', target: 500 },  // Pic extrême
    { duration: '2m', target: 500 },  // Maintien du stress
    { duration: '2m', target: 0 },    // Descente rapide
  ],
  thresholds: {
    http_req_duration: ['p(99)<5000'], // 99% des requêtes < 5s
    http_req_failed: ['rate<0.15'],    // Taux d'erreur < 15%
    stress_errors: ['rate<0.2'],       // Erreurs de stress < 20%
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://staging.onelog-africa.com';

export default function() {
  // Test de stress sur les endpoints critiques
  const endpoints = [
    { url: '/', weight: 30 },
    { url: '/api/missions', weight: 25 },
    { url: '/api/tracking', weight: 20 },
    { url: '/api/notifications', weight: 15 },
    { url: '/api/admin/stats', weight: 10 },
  ];
  
  // Sélection pondérée d'un endpoint
  const random = Math.random() * 100;
  let cumulative = 0;
  let selectedEndpoint = endpoints[0];
  
  for (const endpoint of endpoints) {
    cumulative += endpoint.weight;
    if (random <= cumulative) {
      selectedEndpoint = endpoint;
      break;
    }
  }
  
  const res = http.get(`${BASE_URL}${selectedEndpoint.url}`);
  
  check(res, {
    'Status is 200 or 429': (r) => r.status === 200 || r.status === 429,
    'Response time < 10s': (r) => r.timings.duration < 10000,
  });
  
  errorRate.add(res.status >= 400 && res.status !== 429);
  responseTime.add(res.timings.duration);
  requestCount.add(1);
  
  sleep(0.1); // Pause très courte pour maximiser la charge
}
