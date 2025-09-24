# 🏗️ Architecture Technique - OneLog Africa

*Dernière mise à jour: 09/09/2024 - Phase 2*

## 📋 Vue d'Ensemble

OneLog Africa est une plateforme logistique panafricaine construite sur une architecture moderne, scalable et sécurisée, optimisée pour les besoins des transporteurs et exploitants.

## 🎯 Stack Technique

### **Frontend**
- **Framework:** React 18 + TypeScript
- **Styling:** Tailwind CSS + Shadcn/UI
- **State Management:** React Query (TanStack Query)
- **Routing:** React Router v6
- **Build Tool:** Vite
- **Testing:** Vitest + Playwright

### **Backend & Database**
- **BaaS:** Supabase (PostgreSQL + Auth + Realtime)
- **Authentication:** Supabase Auth + RBAC
- **Storage:** Supabase Storage
- **Real-time:** Supabase Subscriptions

### **Infrastructure**
- **Cache:** Redis Cloud
- **CDN:** Cloudflare
- **Monitoring:** Sentry + Grafana + Prometheus
- **CI/CD:** GitHub Actions
- **Containerization:** Docker + Docker Compose

## 🏛️ Architecture Applicative

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────┤
│  Dashboard  │  Auth  │  Maps  │  Notifications  │  Reports  │
├─────────────────────────────────────────────────────────────┤
│                    HOOKS & SERVICES                         │
├─────────────────────────────────────────────────────────────┤
│  useAuth  │  useMissions  │  usePositions  │  useRole       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE BACKEND                         │
├─────────────────────────────────────────────────────────────┤
│  Auth  │  Database  │  Storage  │  Edge Functions  │  RLS   │
├─────────────────────────────────────────────────────────────┤
│                    POSTGRESQL                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 SERVICES EXTERNES                           │
├─────────────────────────────────────────────────────────────┤
│  Redis Cache  │  Twilio SMS  │  Google Maps  │  Monitoring  │
└─────────────────────────────────────────────────────────────┘
```

## 🗄️ Modèle de Données

### **Tables Principales**

#### **Utilisateurs & Authentification**
```sql
-- Profils utilisateurs
profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Rôles système
roles (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE, -- client, chauffeur, exploitant, admin
  description TEXT
)

-- Attribution des rôles
user_roles (
  user_id UUID REFERENCES profiles(id),
  role_id INTEGER REFERENCES roles(id),
  role_status TEXT DEFAULT 'approved'
)
```

#### **Missions & Logistique**
```sql
-- Missions de transport
missions (
  id UUID PRIMARY KEY,
  reference TEXT UNIQUE,
  client_id UUID REFERENCES profiles(id),
  driver_id UUID REFERENCES profiles(id),
  vehicle_id UUID REFERENCES vehicles(id),
  status TEXT, -- pending, in_progress, completed, cancelled
  priority TEXT, -- low, medium, high, urgent
  pickup_location TEXT,
  delivery_location TEXT,
  pickup_date TIMESTAMP,
  delivery_date TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Suivi GPS temps réel
tracking_points (
  id UUID PRIMARY KEY,
  mission_id UUID REFERENCES missions(id),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  accuracy DECIMAL(8,2),
  speed DECIMAL(8,2),
  created_at TIMESTAMP
)
```

#### **Facturation & Notifications**
```sql
-- Factures multi-acteurs
invoices (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES profiles(id),
  billing_period TEXT, -- monthly, weekly, per_shipment
  total_amount DECIMAL(12,2),
  status TEXT, -- draft, sent, paid, overdue
  created_at TIMESTAMP
)

-- Système de notifications
notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  type TEXT, -- sms, email, push, whatsapp
  title TEXT,
  message TEXT,
  status TEXT, -- pending, sent, delivered, failed
  created_at TIMESTAMP
)
```

## 🔐 Sécurité & Authentification

### **Row Level Security (RLS)**
```sql
-- Politique RLS pour missions
CREATE POLICY "Users can view own missions" ON missions
  FOR SELECT USING (
    client_id = auth.uid() OR 
    driver_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('exploitant', 'admin')
    )
  );
```

### **Authentification Multi-Rôles**
- **Client:** Créer demandes, suivi missions, factures
- **Chauffeur:** Missions assignées, GPS, incidents
- **Exploitant:** Validation, planification, supervision
- **Admin:** Accès complet, configuration système

## 🚀 Performance & Scalabilité

### **Optimisations Database**
```sql
-- Indices de performance
CREATE INDEX idx_missions_status_created_at ON missions(status, created_at DESC);
CREATE INDEX idx_tracking_points_mission_created ON tracking_points(mission_id, created_at DESC);
CREATE INDEX idx_notifications_user_status ON notifications(user_id, status, created_at DESC);
```

### **Cache Strategy**
- **Redis:** Cache des requêtes fréquentes (missions actives, positions récentes)
- **React Query:** Cache côté client avec invalidation intelligente
- **CDN:** Assets statiques via Cloudflare

### **Real-time Updates**
```typescript
// Abonnement temps réel Supabase
const subscription = supabase
  .channel('missions-realtime')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'missions' },
    (payload) => handleRealtimeChange(payload)
  )
  .subscribe();
```

## 📱 Architecture Frontend

### **Structure des Composants**
```
src/
├── components/           # Composants réutilisables
│   ├── ui/              # Composants UI de base (Shadcn)
│   ├── auth/            # Authentification
│   ├── dashboard/       # Tableaux de bord
│   ├── maps/            # Géolocalisation
│   └── notifications/   # Système de notifications
├── hooks/               # Hooks personnalisés
│   ├── useAuth.tsx      # Authentification
│   ├── useMissions.tsx  # Gestion missions
│   ├── usePositions.tsx # Tracking GPS
│   └── useRole.tsx      # Gestion des rôles
├── pages/               # Pages principales
├── services/            # Services métier
└── lib/                 # Utilitaires et configuration
```

### **Hooks Métier Principaux**
```typescript
// Hook d'authentification
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? error.message : null };
  }, []);
  
  return { user, loading, signIn, signOut };
}

// Hook de gestion des missions
export function useMissions() {
  return useQuery({
    queryKey: ["missions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("missions")
        .select("*, vehicles(plate_number), profiles!missions_client_id_fkey(full_name)")
        .order("created_at", { ascending: false });
      
      if (error) throw new Error(error.message);
      return data;
    },
    refetchInterval: 30000,
  });
}
```

## 🔄 CI/CD & Déploiement

### **Pipeline GitHub Actions**
```yaml
# .github/workflows/ci-cd-production.yml
name: CI/CD Production
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Tests
        run: |
          npm ci
          npm run test
          npm run test:e2e

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Production
        run: |
          docker-compose -f docker-compose.production.yml up -d
```

### **Blue-Green Deployment**
- **Blue:** Version actuelle en production
- **Green:** Nouvelle version en staging
- **Switch:** Basculement instantané via load balancer
- **Rollback:** Retour à la version précédente < 5min

## 📊 Monitoring & Observabilité

### **Métriques Clés**
- **Performance:** Temps de réponse API p95 < 1s
- **Disponibilité:** Uptime > 99.9%
- **Erreurs:** Taux d'erreur < 0.5%
- **Utilisateurs:** Connexions simultanées

### **Stack Monitoring**
- **APM:** Sentry pour erreurs et performance
- **Métriques:** Prometheus + Grafana
- **Logs:** Structured logging avec Winston
- **Alerting:** Notifications Slack/Email automatiques

## 🔧 Configuration Environnements

### **Variables d'Environnement**
```bash
# Production
NODE_ENV=production
VITE_SUPABASE_URL=https://fhiegxnqgjlgpbywujzo.supabase.co
VITE_SUPABASE_ANON_KEY=***
REDIS_URL=redis://redis:6379
SENTRY_DSN=***
```

### **Secrets Management**
- **GitHub Secrets:** Clés API et tokens
- **Vault:** Secrets sensibles en production
- **Rotation:** Rotation automatique des clés

## 📈 Évolutions Futures

### **Phase 3 - Roadmap**
- **Microservices:** Découpage en services spécialisés
- **Event Sourcing:** Traçabilité complète des événements
- **AI/ML:** Optimisation des routes et prédictions
- **Mobile Apps:** Applications natives iOS/Android
- **API Gateway:** Gestion centralisée des APIs

---

**Architecture validée pour production - Scalable jusqu'à 10k utilisateurs simultanés**
