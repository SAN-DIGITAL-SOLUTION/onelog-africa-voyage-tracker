# Audit Complet de l'Application OneLog Africa - Voyage Tracker

**Date de l'audit :** 30 août 2025

## 1. Contexte et Objectifs

Cet audit a été réalisé à la demande du client pour évaluer l'état actuel du code source suite à d'importantes modifications de l'UI/UX. L'objectif est d'identifier la dette technique, les composants dupliqués, les incohérences architecturales et les déviations par rapport au contexte métier de l'application (logistique et transport).

## 2. Synthèse des Problèmes Majeurs

L'application souffre d'une dette technique significative qui affecte sa maintenabilité, sa stabilité et sa cohérence. Les problèmes peuvent être regroupés en trois catégories principales :

1.  **Duplication et Incohérence de l'Architecture** : Des composants et des pages en double coexistent, rendant le code source confus et difficile à maintenir.
2.  **Dénaturation de la Logique Métier** : Certaines fonctionnalités clés ont été vidées de leur substance ou remplacées par des pages de test, s'éloignant de l'objectif premier de l'application.
3.  **Gestion Chaotique de la Base de Données** : Les migrations SQL sont désorganisées, redondantes et sujettes à des erreurs, ce qui a causé les bugs récents.

## 3. Analyse Détaillée

### 3.1. Structure du Projet et Composants UI

*   **Dossier `components/` en double** : Il existe un dossier `components/` à la racine et un autre dans `src/components/`. Les recherches ont confirmé que les composants à la racine (`DemandeForm.tsx`, `AffectationForm.tsx`, etc.) sont **obsolètes et non utilisés**. Ils doivent être supprimés.
*   **Redondance des composants de carte** : Le dossier `src/components/` contient plusieurs implémentations de cartes (`GoogleMap.tsx`, `MapboxCluster.tsx`, `LiveMap.tsx`). Cela indique des changements de technologie non finalisés et une dette technique.
*   **Structure de `src/` confuse** : La présence de dossiers comme `modules/` et `sections/` sans convention claire nuit à la lisibilité du projet.

### 3.2. Logique Métier et Pages

*   **Multiples Dashboards redondants** : Le dossier `src/pages/` contient une profusion de dashboards (`AdminDashboard`, `ClientDashboard`, `Dashboard`, `QADashboard`).
    *   `Dashboard.tsx` est une page **statique et non fonctionnelle**.
    *   `QADashboard.tsx` est le **vrai dashboard fonctionnel** pour les transporteurs, mais son nom est trompeur.
*   **Pages "dénaturées"** :
    *   `TrackingMap.tsx` est un fichier presque vide, confirmant la perte de la fonctionnalité de géolocalisation.
    *   Des pages de test (`TrackingDemo.tsx`, `PromptIAStubs.tsx`) sont présentes dans le code de production.

### 3.3. Base de Données (Migrations Supabase)

*   **Gestion des migrations chaotique** : Le dossier `supabase/migrations/` est un mélange de scripts manuels et auto-générés, sans convention de nommage claire.
*   **Scripts redondants et conflictuels** : Plusieurs scripts tentent de modifier les mêmes tables (ex: `notifications`), ce qui augmente le risque d'erreurs.
*   **Dépendances non gérées** : Des migrations ont échoué par le passé car elles dépendaient de fonctions SQL (`is_admin`, etc.) qui n'avaient pas encore été créées.

## 4. Recommandations et Plan d'Action

Pour restaurer la santé du projet, les actions suivantes sont recommandées par ordre de priorité :

1.  **Nettoyage de l'Architecture** :
    *   **Supprimer** le dossier `components/` à la racine du projet.
    *   **Renommer** `src/pages/QADashboard.tsx` en `src/pages/ExploiteurDashboard.tsx` pour refléter son rôle.
    *   **Supprimer** la page statique `src/pages/Dashboard.tsx`.
    *   **Supprimer** les pages de test (`TrackingDemo.tsx`, `PromptIAStubs.tsx`).

2.  **Restauration de la Logique Métier** :
    *   **Ré-implémenter** la fonctionnalité de géolocalisation dans `src/pages/TrackingMap.tsx` en se basant sur un des composants de carte existants.
    *   **Consolider** les différents dashboards en un seul composant qui s'adapte au rôle de l'utilisateur connecté.

3.  **Assainissement de la Base de Données** :
    *   **Auditer** toutes les migrations dans `supabase/migrations/` pour supprimer les scripts redondants.
    *   **Créer un seul script de schéma de base** (`create-base-schema.sql`) qui regroupe toutes les créations de tables, de fonctions et de politiques RLS pour garantir la cohérence.
    *   **Adopter une convention de nommage stricte** pour les futures migrations.

Cet audit fournit une feuille de route claire pour corriger les problèmes actuels et repartir sur des bases saines.
