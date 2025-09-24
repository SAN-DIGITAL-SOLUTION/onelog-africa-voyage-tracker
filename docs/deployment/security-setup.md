# 🔐 Configuration Sécurité Production

## Variables d'environnement critiques

### Backend (Secret Manager)
```bash
# Supabase
SUPABASE_URL=https://fhiegxnqgjlgpbywujzo.supabase.co
SUPABASE_SERVICE_KEY=sk_service_[...]  # Service role - garder secret
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9[...]  # Limité

# Maps
MAPBOX_TOKEN=pk.eyJ1Ijoi[...]  # Secret manager

# Monitoring
SENTRY_DSN=https://[...]@sentry.io/[...]
```

### Frontend (Limité)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://fhiegxnqgjlgpbywujzo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9[...]
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1Ijoi[...]
```

## Configuration Secret Manager

### Vercel
```bash
vercel env add SUPABASE_SERVICE_KEY production
vercel env add MAPBOX_TOKEN production
vercel env add SENTRY_DSN production
```

### Netlify
```bash
netlify env:set SUPABASE_SERVICE_KEY sk_service_[...]
netlify env:set MAPBOX_TOKEN pk.eyJ1Ijoi[...]
```

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
env:
  SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
  MAPBOX_TOKEN: ${{ secrets.MAPBOX_TOKEN }}
  SENTRY_DSN: ${{ secrets.SENTRY_DSN }}
```

## Audit PHP Sécurité

### Endpoints à sécuriser
- `php/create_mission.php`
- `php/log_position.php`
- `php/mission_summary.php`
- `php/notify_transporter.php`

### Vérifications requises
- [ ] Input sanitization
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] Rate limiting
- [ ] Authentication tokens
