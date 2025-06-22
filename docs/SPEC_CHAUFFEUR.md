# Spécification fonctionnelle – Module Chauffeur (MVP)

## Objectifs
- Gestion complète des missions attribuées au chauffeur
- Traçabilité des actions et incidents
- Expérience mobile-first

## Fonctionnalités principales

### 1. Tableau de bord missions
- Liste des missions en cours, à venir, terminées
- Filtres par statut, date, type de mission
- Accès aux détails de chaque mission

### 2. Actions sur missions
- Accepter/refuser une mission
- Démarrer/terminer une mission
- Saisie de signature de livraison (modal)
- Déclaration d’incident (modal, upload photo/texte)

### 3. Tracking et notifications
- Suivi GPS temps réel (mobile)
- Notifications push (nouvelle mission, incident, rappel)
- Historique des positions (phase 2)

### 4. Historique et export
- Historique des missions et incidents
- Export PDF/CSV de l’historique (phase 2)

## Sécurité
- RLS stricte sur missions, incidents, tracking (chauffeur = auth.uid())
- Vérification du rôle chauffeur à chaque action

## QA & Tests
- Fiche QA dédiée (acceptation, démarrage, incidents, signature)
- Tests d’accès (chauffeur uniquement)
- Vérification tracking et notifications
