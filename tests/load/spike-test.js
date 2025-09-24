import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Test de pic soudain de trafic
export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Trafic normal
    { duration: '10s', target: 1000 }, // Pic soudain
    { duration: '30s', target: 1000 }, // Maintien du pic
    { duration: '10s', target: 10 },   // Retour normal
    { duration: '30s', target: 10 },   // Stabilisation
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.25'], // Plus tolérant pour les pics
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://staging.onelog-africa.com';

export default function() {
  const res = http.get(`${BASE_URL}/`);
  
  check(res, {
    'Survives spike': (r) => r.status < 500,
    'Response time reasonable': (r) => r.timings.duration < 5000,
  });
  
  sleep(0.5);
}
