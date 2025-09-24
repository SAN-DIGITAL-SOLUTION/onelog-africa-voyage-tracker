# 📺 Conception Technique – OneLog Africa TV Dashboard

*Dernière mise à jour: 09/09/2024 - 16:37*

## 1. 🎯 Objectif

Mettre à disposition des transporteurs et exploitants un mode TV du dashboard OneLog Africa, affichable sur grands écrans (salles de contrôle, bureaux, entrepôts).

Ce mode doit offrir :
- Une connexion simplifiée et sécurisée
- Un affichage en plein écran optimisé
- Une mise à jour automatique des données
- Des modes d'usage adaptés aux différents environnements (salle de contrôle, bureaux, quais)

## 2. 🔐 Authentification TV

### 2.1 Connexion Web Standard (✅ déjà disponible)

- Ouvrir un navigateur sur TV (Smart TV, box Android, Apple TV, mini-PC)
- Accéder à : `https://app.onelogafrica.com/fullscreen-dashboard`
- Authentification avec identifiants standard (admin/exploitant)
- Lancement automatique en mode plein écran

### 2.2 Connexion par Code PIN Temporaire (🚀 à implémenter – recommandé)

- Génération d'un code PIN 6 chiffres côté admin
- Saisie du PIN sur la TV pour créer une session
- Session valide 8h par défaut (configurable)
- Permissions limitées (lecture seule)

**Pseudocode :**
```typescript
export function useTVAuth() {
  const generatePinCode = () => {
    // Génère un code PIN unique (6 chiffres)
    // Expiration après 8h
  };

  const authenticateWithPin = (pin: string) => {
    // Vérifie la validité du PIN
    // Crée une session lecture seule pour TV
  };
}
```

### 2.3 Connexion par QR Code (🔮 optionnelle)

- Génération d'un QR Code depuis l'interface admin
- Scan via TV/tablette pour connexion automatique
- Idéal pour installations temporaires

## 3. ⚙️ Configuration Optimisée

### 3.1 Raccourcis Clavier (✅ implémentés)

- `F11` → Activer/désactiver plein écran
- `F5` → Rafraîchir les données
- `F` → Afficher/masquer filtres
- `S` → Ouvrir panneau paramètres
- `ESC` → Quitter mode TV

### 3.2 Auto-Configuration (✅ implémentée)

- Détection automatique de la résolution TV
- Ajustement UI (taille police, cartes, marges)
- Mode sombre activé automatiquement (selon heure locale)
- Rafraîchissement auto toutes les 30s

## 4. 🏢 Scénarios d'Usage

### 4.1 Salle de Contrôle Centrale
- TV ≥ 55" avec box Android/PC mini
- Connexion permanente via compte dédié
- Affichage en continu des missions en cours

### 4.2 Bureaux Exploiteurs
- TV ou écran secondaire de bureau
- Connexion rapide via QR Code
- Filtres appliqués par zone géographique

### 4.3 Entrepôts / Quais de Chargement
- Tablettes ou écrans tactiles muraux
- Mode simplifié : missions du jour uniquement
- Notifications visuelles mises en avant

## 5. 🔧 Implémentations Futures

### 5.1 Système PIN TV
- Génération/gestion codes PIN temporaires
- Sessions lecture seule limitées

### 5.2 Connexion QR Code
- Génération dynamique QR code côté admin
- Scan pour authentification rapide

### 5.3 Monitoring dédié
- Détection automatique de perte de connexion
- Reconnexion silencieuse

### 5.4 Kiosque Mode
- Empêcher sortie du dashboard hors ESC
- Idéal pour affichage public

## 6. 📋 État d'Implémentation

| Fonctionnalité | Statut | Priorité | Notes |
|----------------|--------|----------|-------|
| Dashboard Plein Écran | ✅ Terminé | P0 | `/fullscreen-dashboard` fonctionnel |
| Raccourcis Clavier | ✅ Terminé | P0 | F11, F5, F, S, ESC |
| Auto-refresh | ✅ Terminé | P0 | 30s par défaut, configurable |
| Filtres Dynamiques | ✅ Terminé | P0 | Status, priorité, clients, véhicules |
| Authentification Standard | ✅ Terminé | P0 | Via comptes existants |
| Système PIN TV | 🔴 À faire | P1 | Connexion simplifiée |
| QR Code Auth | 🔴 À faire | P2 | Installation rapide |
| Kiosque Mode | 🔴 À faire | P2 | Sécurité affichage public |

## 7. 🚀 Roadmap Technique

### Phase 1 (Terminée ✅)
- Dashboard plein écran fonctionnel
- Interface optimisée grands écrans
- Mise à jour temps réel
- Raccourcis clavier

### Phase 2 (Prochaine)
- Système d'authentification PIN
- Interface de gestion des codes TV
- Sessions limitées lecture seule

### Phase 3 (Future)
- Authentification QR Code
- Mode kiosque sécurisé
- Analytics d'usage TV

---

**✅ Statut actuel :** Authentification standard fonctionnelle  
**🚀 Prochain focus :** Implémentation du système PIN (priorité haute)
