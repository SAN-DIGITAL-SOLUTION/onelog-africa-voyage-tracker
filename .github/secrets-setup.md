# Configuration des Secrets GitHub pour CI/CD

## Secrets à ajouter dans GitHub (Settings → Secrets and variables → Actions)

### 🔑 Secrets Obligatoires
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
MAPBOX_PUBLIC_KEY=your-mapbox-public-token
```

### 🔔 Notifications (Optionnel)
```bash
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
SENTRY_DSN=https://your-sentry-dsn
```

## Configuration des Variables d'Environnement

### Variables de Repository (Settings → Secrets and variables → Variables)
```bash
NODE_VERSION=18
FRONTEND_URL=http://localhost:5173
BACKEND_PORT=3001
```

## Instructions d'Installation

### 1. Ajouter les secrets dans GitHub
1. Allez dans votre repository GitHub
2. Cliquez sur **Settings** → **Secrets and variables** → **Actions**
3. Cliquez sur **New repository secret**
4. Ajoutez chaque secret avec son nom et valeur

### 2. Vérifier les permissions
- **SUPABASE_SERVICE_ROLE_KEY**: Ne jamais exposer côté frontend
- **SUPABASE_ANON_KEY**: Safe pour le frontend
- **MAPBOX_PUBLIC_KEY**: Token public sans restrictions sensibles

### 3. Tester la configuration
```bash
# Test local
npm run test:ci
npm run cypress:run
```

## Badge de Build
Ajoutez ce badge dans votre README.md:
```markdown
![CI](https://github.com/YOUR_USERNAME/onelog-africa-voyage-tracker/workflows/CI%20-%20Control%20Room%20Tests%20&%20E2E/badge.svg)
```

## Monitoring des Secrets
- Revoir les secrets tous les 90 jours
- Utiliser des tokens avec expiration minimale
- Activer les notifications de sécurité GitHub
