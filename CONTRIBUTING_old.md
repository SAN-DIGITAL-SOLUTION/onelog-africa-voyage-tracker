# Guide de Contribution OneLog Africa

## 🚀 Méthode de Développement IA-FIRST

OneLog Africa suit une approche de développement **IA-FIRST** (Identify → Analyze → Fix → Iterate → Review → Ship) pour une livraison continue et automatisée.

### Principes Clés

1. **Porté par un non-codeur** : Le développement est piloté par des objectifs métier, pas par des contraintes techniques.
2. **Délégation complète** : L'IA gère l'implémentation de bout en bout.
3. **Zéro validation intermédiaire** : Les tâches validées sont exécutées sans approbation manuelle.
4. **Exécution autonome** : L'IA gère les dépendances, les tests et la documentation.

### Workflow Type

1. **Identify** : Analyse des besoins et des tâches
2. **Analyze** : Revue du code existant et des dépendances
3. **Fix/Implement** : Développement des fonctionnalités
4. **Iterate** : Amélioration continue basée sur les retours
5. **Review** : Vérification automatique de la qualité
6. **Ship** : Déploiement et documentation

## 🛠 Exemple d'Application par Module

### Module Authentification
- **IA-FIRST** : Implémentation automatique de l'authentification JWT avec rafraîchissement de token
- **Résultat** : Système sécurisé avec tests E2E, sans intervention manuelle

### Module Suivi en Temps Réel
- **IA-FIRST** : Configuration de WebSockets et gestion d'état
- **Résultat** : Mise à jour en temps réel des positions GPS

## 📦 Structure des Dossiers

- `/scripts` : Scripts d'automatisation et de déploiement
- `/src/modules` : Code source organisé par fonctionnalité
- `/cypress` : Tests E2E
- `/docs` : Documentation technique

## 🧪 Tests

- **Unitaires** : Vitest
- **E2E** : Cypress
- **Couverture** : Rapport de couverture automatique

## 🔄 Intégration Continue

- Exécution automatique des tests à chaque push
- Déploiement automatique en préproduction après validation des tests
- Mise à jour automatique de la documentation

## 📝 Bonnes Pratiques

- Commit atomique avec messages explicites
- Documentation en anglais
- Validation automatique du code (ESLint, Prettier)

## 🤖 Automatisation

Des scripts sont disponibles pour :
- Mettre à jour la roadmap (`scripts/update-roadmap.js`)
- Synchroniser avec Notion (`scripts/export-roadmit-notion.js`)
- Générer la documentation technique

---

*Dernière mise à jour : 2025-06-23*
