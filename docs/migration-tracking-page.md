# Migration Page Suivi Live - Documentation

## Résumé de la Migration

L'ancienne page de suivi GPS (`/tracking`) a été remplacée par la nouvelle **Salle de Contrôle** (`/control-room`) avec Mapbox.

## Changements Effectués

### 1. Remplacement de la page TrackingMap
- **Fichier modifié**: `src/pages/TrackingMap.tsx`
- **Action**: Remplacement complet par une redirection vers `/control-room`
- **Ancienne fonctionnalité**: Google Maps avec saisie manuelle de clé API
- **Nouvelle fonctionnalité**: Mapbox avec interface professionnelle

### 2. Routes React Router
- **Fichier modifié**: `src/App.tsx`
- **Nouvelle route**: `/control-room` → `ControlRoom` component
- **Redirection**: `/tracking` → `/control-room` (avec `replace: true`)

### 3. Navigation Mise à Jour
- **Ancien lien**: `/tracking` (Google Maps)
- **Nouveau lien**: `/control-room` (Mapbox Control Room)

## Fonctionnalités de la Nouvelle Salle de Contrôle

### Interface Mapbox
- Carte interactive avec clusters de véhicules
- Marqueurs colorés par statut (en route, en attente, livré, retour)
- Popups détaillées au clic sur les véhicules
- Mode plein écran et mode TV/projection

### Filtres en Temps Réel
- Par véhicule
- Par mission
- Par statut
- Mise à jour automatique

### Statistiques Live
- Nombre de véhicules actifs
- Répartition par statut
- Positions GPS en temps réel
- Historique des positions récentes

## URLs Impactées

| Ancienne URL | Nouvelle URL | Action |
|--------------|--------------|---------|
| `/tracking` | `/control-room` | Redirection automatique |
| `/control-room` | `/control-room` | Nouvelle page principale |

## Configuration Requise

### Variables d'environnement
```bash
# Dans .env.local ou .env
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
VITE_MAPBOX_STYLE=mapbox/streets-v11
```

### Permissions Supabase
- Table `tracking_points` accessible en lecture
- Table `missions` accessible en lecture
- Table `vehicules` accessible en lecture

## Tests à Effectuer

1. **Navigation**:
   - Accès direct à `/control-room` ✓
   - Redirection depuis `/tracking` ✓
   - Accès avec authentification ✓

2. **Fonctionnalités**:
   - Affichage de la carte Mapbox ✓
   - Chargement des positions GPS ✓
   - Application des filtres ✓
   - Mode plein écran ✓

3. **Performance**:
   - Chargement initial < 2s
   - Mise à jour temps réel < 1s
   - Support mobile/tablette

## Notes de Déploiement

- Aucune configuration serveur supplémentaire requise
- Les anciennes URLs sont automatiquement redirigées
- Compatible avec tous les rôles utilisateurs
- Mode offline avec polling disponible via feature flags

## Support

En cas de problème:
1. Vérifier la configuration Mapbox dans `.env.local`
2. Vérifier les permissions Supabase
3. Consulter les logs dans la console navigateur
4. Vérifier la connexion réseau WebSocket
