# 🏢 Salle de Contrôle Transporteurs - OneLog Africa

Une application de suivi en temps réel des véhicules et missions pour transporteurs, avec carte interactive Mapbox et mises à jour en temps réel via Supabase.

## 🚀 Fonctionnalités

### Vue Carte Interactive
- **Carte Mapbox GL JS** avec marqueurs colorés par statut
- **Mise à jour en temps réel** via Supabase Realtime
- **Mode plein écran** et **mode TV projection**
- **Marqueurs personnalisés** avec popups d'information

### Modes d'affichage
- **Mode Opérateur** : Carte + sidebar avec filtres et statistiques
- **Mode TV** : Carte plein écran sans distractions
- **Mode Projection** : Idéal pour écrans de salle de contrôle

### Filtres Dynamiques
- Par **véhicule**
- Par **mission**
- Par **statut** (en route, en attente, livré, retour)
- Par **période temporelle**

### Statistiques en temps réel
- Nombre de véhicules actifs
- Répartition par statut
- Missions en cours
- Vitesses moyennes

## 📋 Prérequis

- Node.js 16+ 
- npm ou yarn
- Compte Supabase
- Token Mapbox

## 🔧 Installation

### 1. Configuration Supabase

Exécutez la migration SQL pour créer la table `positions`:

```bash
# Dans le dossier supabase/migrations
psql -h your-db-host -U your-user -d your-db -f 20250827_create_control_room_positions.sql
```

### 2. Configuration Backend

```bash
cd server
npm install

# Copier et configurer l'environnement
cp .env.example .env
# Éditer .env avec vos clés Supabase et Mapbox
```

### 3. Configuration Frontend

```bash
# Dans le dossier racine
cp .env.example .env
# Éditer .env avec vos clés

npm install
```

## 🎯 Lancement

### Étape 1: Démarrer le backend

```bash
cd server
npm start
# Le serveur démarre sur http://localhost:3001
```

### Étape 2: Lancer le simulateur (optionnel)

```bash
# Dans un autre terminal
cd server
npm run simulate
# Génère des positions aléatoires toutes les 5 secondes
```

### Étape 3: Démarrer l'application React

```bash
# Dans un autre terminal
npm run dev
# L'application démarre sur http://localhost:5173
```

### Étape 4: Accéder à la salle de contrôle

1. Connectez-vous avec votre compte transporteur
2. Naviguez vers `/control-room`
3. Commencez à surveiller vos véhicules en temps réel!

## 📊 Structure de la base de données

### Table `positions`

```sql
CREATE TABLE positions (
  id UUID PRIMARY KEY,
  vehicule_id VARCHAR(50) NOT NULL,
  mission_id VARCHAR(50) NOT NULL,
  transporteur_id UUID NOT NULL REFERENCES auth.users(id),
  statut VARCHAR(20) CHECK (statut IN ('en_route', 'en_attente', 'livre', 'retour')),
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  vitesse INTEGER DEFAULT 0,
  direction INTEGER DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔌 API Endpoints

### Backend (Port 3001)

- `GET /api/positions/:transporteurId` - Toutes les positions
- `GET /api/positions/:transporteurId/latest` - Dernières positions par véhicule
- `POST /api/positions` - Ajouter une position
- WebSocket: `ws://localhost:3001` - Mises à jour en temps réel

### WebSocket Events

- `position_update` - Nouvelle position reçue
- `join_transporteur` - Rejoindre la room d'un transporteur
- `leave_transporteur` - Quitter la room

## 🎮 Utilisation

### Mode Opérateur
1. **Filtres** : Utilisez la sidebar pour filtrer par véhicule, mission ou statut
2. **Statistiques** : Consultez les indicateurs en temps réel
3. **Détails** : Cliquez sur les marqueurs pour voir les détails

### Mode TV
1. Cliquez sur l'icône **Maximize** pour passer en mode TV
2. La carte occupe tout l'écran
3. Les mises à jour continuent automatiquement

### Mode Plein écran
1. Utilisez le bouton **Plein écran** pour une vue immersive
2. Compatible avec les écrans de salle de contrôle

## 🧪 Tests

### Test avec le simulateur

```bash
# Le simulateur génère automatiquement:
# - 4 véhicules fictifs
# - Positions aléatoires en Côte d'Ivoire
# - Mises à jour toutes les 5 secondes
# - Nettoyage automatique des données > 24h
```

### Test manuel

```bash
# Envoyer une position manuelle
curl -X POST http://localhost:3001/api/positions \
  -H "Content-Type: application/json" \
  -d '{
    "vehicule_id": "VH001",
    "mission_id": "MIS001",
    "transporteur_id": "your-user-id",
    "statut": "en_route",
    "latitude": 5.359952,
    "longitude": -3.998575,
    "vitesse": 80,
    "direction": 45
  }'
```

## 🔒 Sécurité

- **RLS activée** : Chaque transporteur ne voit que ses véhicules
- **Authentification** : Requiert une connexion utilisateur
- **Validation des données** : Types et formats vérifiés

## 🎨 Personnalisation

### Couleurs des statuts
- `en_route` : Vert (#10b981)
- `en_attente` : Orange (#f59e0b)
- `livre` : Bleu (#3b82f6)
- `retour` : Violet (#8b5cf6)

### Icônes personnalisées
Modifiez les icônes dans `src/pages/ControlRoom.tsx` :

```tsx
// Exemple d'icône personnalisée
import { Truck, Route, Clock } from 'lucide-react';
```

## 📱 Responsive

- **Desktop** : Mode opérateur avec sidebar
- **Tablette** : Sidebar rétractable
- **Mobile** : Mode plein écran uniquement

## 🐛 Dépannage

### Erreur de connexion Supabase
```bash
# Vérifiez vos variables d'environnement
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

### Erreur Mapbox
```bash
# Vérifiez votre token Mapbox
VITE_MAPBOX_ACCESS_TOKEN=your-mapbox-token
```

### Ports déjà utilisés
```bash
# Backend: changez le port dans server/.env
PORT=3002

# Frontend: changez le port dans package.json
"dev": "vite --port 5174"
```

## 📞 Support

Pour toute question ou problème, contactez l'équipe OneLog Africa.

---

**OneLog Africa - Salle de Contrôle Transporteurs**  
*Suivi en temps réel, performance optimisée, sécurité renforcée*
