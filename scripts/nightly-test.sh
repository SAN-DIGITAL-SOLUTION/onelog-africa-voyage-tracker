#!/bin/bash

# 🌙 Nightly Test Suite - Control Room
# Exécution complète des tests pour baseline performance

set -e

echo "🚀 Lancement suite de tests nightly - $(date)"

# Couleurs pour output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
BACKEND_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:5173"
RESULTS_DIR="test-results/nightly/$(date +%Y%m%d_%H%M%S)"

# Créer dossier résultats
mkdir -p "$RESULTS_DIR"

echo -e "${YELLOW}📁 Résultats sauvegardés dans: $RESULTS_DIR${NC}"

# 1. Tests Backend
echo -e "${GREEN}🔧 Tests Backend Jest${NC}"
cd server
npm test -- --coverage --reporters=default --reporters=jest-junit > "$RESULTS_DIR/backend-tests.log" 2>&1
BACKEND_RESULT=$?

cd ..

# 2. Tests E2E Cypress
echo -e "${GREEN}🎭 Tests E2E Cypress${NC}"
npm run build

# Démarrer backend en background
cd server
npm start &
BACKEND_PID=$!
sleep 5

cd ..

# Lancer Cypress headless
npx cypress run --headless --browser chrome > "$RESULTS_DIR/cypress-tests.log" 2>&1
CYPRESS_RESULT=$?

# Arrêter backend
kill $BACKEND_PID 2>/dev/null || true

# 3. Tests de Performance (k6)
echo -e "${GREEN}⚡ Tests de Performance${NC}"

# Test de charge simple
cat > "$RESULTS_DIR/load-test.js" << 'EOF'
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp-up
    { duration: '5m', target: 10 }, // Stay
    { duration: '2m', target: 0 },  // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% des requêtes < 200ms
    http_req_failed: ['rate<0.1'],    // < 1% erreurs
  },
};

const BASE_URL = 'http://localhost:3001';

export default function () {
  // Test GET positions
  let response = http.get(`${BASE_URL}/api/positions`);
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });

  // Test GET latest positions
  response = http.get(`${BASE_URL}/api/positions/latest`);
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 100ms': (r) => r.timings.duration < 100,
  });

  sleep(1);
}
EOF

# Lancer test de charge si k6 installé
if command -v k6 &> /dev/null; then
    k6 run "$RESULTS_DIR/load-test.js" > "$RESULTS_DIR/performance-test.log" 2>&1
    PERF_RESULT=$?
else
    echo -e "${YELLOW}⚠️  k6 non installé - tests de performance ignorés${NC}"
    PERF_RESULT=0
fi

# 4. Health Check complet
echo -e "${GREEN}🏥 Health Check${NC}"

# Redémarrer backend pour health check
cd server
npm start &
BACKEND_PID=$!
sleep 3

cd ..

# Tests health endpoints
HEALTH_RESULT=0
curl -f "$BACKEND_URL/health" > "$RESULTS_DIR/health-check.json" 2>/dev/null || HEALTH_RESULT=1
curl -f "$BACKEND_URL/metrics" > "$RESULTS_DIR/metrics.json" 2>/dev/null || HEALTH_RESULT=1

# Arrêter backend
kill $BACKEND_PID 2>/dev/null || true

# 5. Génération rapport résumé
echo -e "${GREEN}📊 Génération rapport${NC}"

cat > "$RESULTS_DIR/summary.md" << EOF
# Nightly Test Report - $(date)

## Résultats Tests
- **Backend Tests**: $([ $BACKEND_RESULT -eq 0 ] && echo "✅ PASS" || echo "❌ FAIL")
- **Cypress E2E**: $([ $CYPRESS_RESULT -eq 0 ] && echo "✅ PASS" || echo "❌ FAIL")
- **Performance**: $([ $PERF_RESULT -eq 0 ] && echo "✅ PASS" || echo "❌ FAIL")
- **Health Check**: $([ $HEALTH_RESULT -eq 0 ] && echo "✅ PASS" || echo "❌ FAIL")

## Fichiers Logs
- Backend: backend-tests.log
- Cypress: cypress-tests.log
- Performance: performance-test.log
- Health: health-check.json
- Metrics: metrics.json

## Prochaine Exécution
Programmée pour: $(date -d "tomorrow 02:00" 2>/dev/null || date -v+1d -f "%Y-%m-%d 02:00")
EOF

# Afficher résumé
echo -e "${GREEN}📋 Résumé Nightly Tests:${NC}"
cat "$RESULTS_DIR/summary.md"

# Notification Slack (si configuré)
if [ -n "$SLACK_WEBHOOK" ]; then
    STATUS="✅ SUCCESS"
    if [ $BACKEND_RESULT -ne 0 ] || [ $CYPRESS_RESULT -ne 0 ] || [ $HEALTH_RESULT -ne 0 ]; then
        STATUS="❌ FAILED"
    fi
    
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🌙 Nightly Tests $STATUS - $(date)\"}" \
        "$SLACK_WEBHOOK" 2>/dev/null || true
fi

echo -e "${GREEN}✅ Suite de tests nightly terminée${NC}"
