# 📦 Directive Technique – Bloc de Livraison Prioritaire PHP

**Projet : OneLog Africa – Module Voyage Tracker**  
**Équipe responsable : Cascade**  
**Date de livraison attendue :** 🗓️ 2 août 2025

---

## 🎯 Objectif du Bloc

Livraison d'un **bloc fonctionnel complet** pour la phase pilote du **Voyage Tracker**, intégrant les correctifs identifiés, les modules PHP critiques, leurs tests, et la documentation technique correspondante.

## 📁 Modules PHP inclus dans ce bloc

| Module                      | État actuel     | Correctifs requis ?    | Tests à livrer    |
| --------------------------- | --------------- | ---------------------- | ----------------- |
| `create_mission.php`        | ✅ OK (minimale) | ✅ Correction logic     | ✅ Unitaire + E2E  |
| `update_mission_status.php` | 🔶 À revoir     | ✅ Format statut        | ✅ Unitaire        |
| `notify_transporter.php`    | ❌ À refaire     | ✅ Structure + failover | ✅ Unitaire + mock |
| `log_position.php`          | 🔶 Incomplet    | ✅ Structure BDD        | ✅ Unitaire + E2E  |
| `mission_summary.php`       | ❌ Indisponible  | ✅ Implémenter          | ✅ Unitaire + E2E  |

## 🔧 Correctifs Techniques Demandés

* 💥 **Statuts invalides** dans `update_mission_status.php` (`undefined index`, absence de mapping)
* 🧱 **Structure incomplète** de `notify_transporter.php` : aucune gestion d'erreur, pas de fallback SMS
* 🗺️ `log_position.php` : format brut GPS non exploité, pas d'enrichissement (timestamp, mission\_id)
* 📉 `mission_summary.php` manquant : aucune vue agrégée pour suivi admin
* 🔄 Cohérence des réponses JSON (format standardisé, success/error booléen + message)

---

## ✅ Tests attendus

### 1. **Tests unitaires PHP (PHPUnit)**

* Pour chaque fichier `.php` incluant des fonctions
* Tester en particulier les cas limites, erreurs de format, et erreurs HTTP

### 2. **Tests E2E avec données simulées (via Postman/Newman)**

* Simulation d'un trajet complet avec : création de mission → notification → log position → update statut → résumé
* Cas d'erreur : mauvaise mission\_id, transporteur inactif, format GPS invalide

## ✅ Modules Validés

| Module | Statut | Couverture Tests | Responsable | Date Validation |
|--------|--------|-----------------|-------------|-----------------|
| Timeline (Phase 3) | ✅ 90% | 85% | Équipe Frontend | 2025-07-28 |
| Notifications | ✅ 80% | 78% | Équipe Backend | 2025-07-27 |
| Authentification | ✅ 85% | 82% | Équipe Sécurité | 2025-07-29 |

## 🔧 Modules en Cours

### 🧩 Tableau de Bord Cartes (Phase 2)
- **Progression** : 65%
- **Prochaine Étape** : Finalisation de l'intégration des données
- **Date Cible** : 2025-08-10

### 🛠️ Module d'Administration
- **Progression** : 55%
- **Prochaine Étape** : Finalisation de la gestion des rôles
- **Date Cible** : 2025-08-15

## 🧪 Tests

### 🔬 Tests E2E (Cypress)
- **Couverture Actuelle** : 75%
- **Objectif** : 90%
- **Prochaine Étape** : Ajout de tests pour la gestion des rôles

### 🔍 Tests Unitaires (Jest/Vitest)
- **Couverture Actuelle** : 82%
- **Objectif** : 90%
- **Prochaine Étape** : Amélioration de la couverture des services

## 🚨 Problèmes en Cours

| Problème | Statut | Priorité | Responsable |
|----------|--------|----------|-------------|
| Performance requêtes BDD | En cours | Haute | Équipe Backend |
| Gestion des rôles | En attente | Haute | Équipe Sécurité |
| UI/UX sur mobile | En cours | Moyenne | Équipe Frontend |

## 📤 Livrables à remettre

* `php/` : Dossiers avec chaque script fonctionnel (nommé comme les modules)
* `tests/` :
  * `unit/` : fichiers PHPUnit `.php`
  * `e2e/` : fichiers Postman `.json` + éventuel script Newman
* `docs/` :
  * `README.md` par module (structure + params + réponse)
  * `test_plan.md` : description des cas de test
* `report/` :
  * `bugfix_log.md` : résumé des correctifs appliqués
  * `delivery_status.md` : checklist livrée avec statuts

---

## 📦 Structure du dépôt

```
onelog-voyage-tracker/
├── php/
│   ├── create_mission.php
│   ├── update_mission_status.php
│   ├── notify_transporter.php
│   ├── log_position.php
│   └── mission_summary.php
├── tests/
│   ├── unit/
│   └── e2e/
├── docs/
│   ├── README_create.md
│   ├── README_notify.md
│   └── test_plan.md
└── report/
    ├── bugfix_log.md
    └── delivery_status.md
```

---

## 🧪 Contrôles qualité

* ✅ **Validation des tests Postman par supervision**
* ✅ **Revue de code obligatoire avant push**
* ✅ **Éviter les réponses HTML, privilégier JSON systématique**
* ✅ **Pas de dépendances non documentées**

---

## 🧭 Prochaine étape

**⏱️ Deadline bloc PHP : Vendredi 2 août 2025 à 18h UTC**  
Supervision technique : 🧠 [Responsable technique Cascade]  
Canal de support : `#dev-voyage-tracker`

## 🚚 Processus de livraison

1. ✅ **Livraison sur branche `bloc-livraison-prioritaire`**
2. ✅ Vérification des tests automatiques et manuels
3. ✅ Revue de code (pull request)
4. ✅ Fusion dans la branche `staging`
5. ✅ Rapport final envoyé au superviseur technique

## 🧭 Suivi des problèmes critiques

| ID     | Problème détecté                                | État         |
|--------|--------------------------------------------------|--------------|
| BUG-001| Vitesse moyenne `NaN` si un seul point GPS       | ❌ À corriger |
| BUG-002| API GPS accepte requêtes sans token              | ✅ Corrigé    |
| BUG-003| Mauvais horodatage dans le journal               | ❌ À corriger |
| BUG-004| Trop de requêtes AJAX dans le tableau suivi      | ⏳ En cours   |

---

## 📌 Deadline

**⚠️ Date limite de livraison complète : vendredi 2 août 2025 à 23h59 GMT+0**

---

📥 **À faire par Cascade :**

- [ ] Confirmer la prise en charge de ce bloc
- [ ] Créer la branche dédiée
- [ ] Implémenter, tester, documenter chaque module
- [ ] Livrer l'ensemble dans les temps avec vérification rigoureuse

## 📊 Suivi des Problèmes

| Problème | Module | Statut | Priorité |
|----------|--------|--------|----------|
| Incohérences timestamp | tracking-engine | 🔄 En cours | Haute |
| Bug rapport multiple | incident-reporter | 🔄 En cours | Moyenne |
| Manque de logs | feedback-handler | 🔄 En cours | Basse |

## 📝 Notes Additionnelles

- Tous les correctifs doivent être documentés dans `CHANGELOG.md`
- Les tests doivent inclure des cas d'utilisation réels
- La documentation doit être mise à jour avant la validation finale

### 🟠 Priorité Moyenne
1. Optimiser les performances
2. Améliorer la couverture des tests
3. Documenter pour les utilisateurs finaux

### 🟢 Faible Priorité
1. Améliorations UI/UX
2. Optimisations de performance mineures
3. Documentation additionnelle

## 📁 Livrables

| Livrable | Statut | Responsable | Date Cible |
|----------|--------|-------------|------------|
| Tests E2E | En cours | QA Team | 2025-08-20 |
| Documentation API | À démarrer | Tech Lead | 2025-08-25 |
| Pipeline CI/CD | Planifié | DevOps | 2025-08-18 |
| Sécurité | En cours | Sécurité | 2025-08-22 |

## 📝 Notes
- Les objectifs de couverture de test doivent être atteints avant le déploiement en production
- La documentation doit être maintenue à jour à chaque modification majeure
- Les revues de code sont obligatoires pour toutes les pull requests
