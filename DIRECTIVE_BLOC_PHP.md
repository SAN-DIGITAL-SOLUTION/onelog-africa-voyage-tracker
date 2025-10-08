# 📦 Directive Bloc PHP – OneLog Africa Voyage Tracker

## 🔖 Contexte général

Ce bloc fait partie du **lot de livraison prioritaire** demandé suite aux retours utilisateurs (transporteurs) et aux résultats des tests partagés. Il s'inscrit dans la phase critique de stabilisation du module **Suivi des Missions de Transport** (Voyage Tracker).

L'objectif principal est de **corriger les bugs critiques, compléter les modules partiels, garantir une couverture de test suffisante et produire une documentation complète**.

---

## 🧱 Modules à finaliser (dossier `/php/`)

| Fichier                     | Statut actuel            | Priorité | Actions attendues                        |
| --------------------------- | ------------------------ | -------- | ---------------------------------------- |
| `create_mission.php`        | MVP OK – test KO         | Haute    | Implémenter validation + test unitaire   |
| `update_mission_status.php` | Comportement instable    | Haute    | Corriger gestion erreurs statut invalide |
| `log_position.php`          | Manque traitement GPS    | Moyenne  | Ajouter validation + log format horodaté |
| `mission_summary.php`       | Statistiques incomplètes | Haute    | Ajouter durée mission + distance totale  |
| `notify_transporter.php`    | Notification non envoyée | Haute    | Implémenter fallback + log des erreurs   |

---

## 🧪 Exigences de test

### ✅ Unitaires (PHPUnit)

* Chaque module doit être testé avec **au moins 3 cas : succès / échec logique / échec système**.
* Tous les tests doivent être centralisés dans `/tests/unit/` avec nommage clair (`NomDuFichierTest.php`).

### 🌐 Intégration (E2E simulée)

* Créer un fichier `tests/e2e/MissionLifecycleTest.php` simulant un cycle complet :

  1. Création de mission
  2. Envoi de positions GPS
  3. Statut mis à jour jusqu'à `completed`
  4. Résumé mission consulté

---

## 🛠️ Correctifs techniques à appliquer (issus des logs de test)

| Module                      | Bug identifié                                 | Directive correctif                                |
| --------------------------- | --------------------------------------------- | -------------------------------------------------- |
| `create_mission.php`        | Retourne `500` si champ `transporter_id` vide | Ajouter validation avec message 422                |
| `update_mission_status.php` | Accepte statut inexistant                     | Vérifier `status IN (planned, ongoing, completed)` |
| `log_position.php`          | Accepte coordonnées vides                     | Forcer validité latitude/longitude                 |
| `mission_summary.php`       | Ne renvoie pas la durée                       | Calculer `end_time - start_time`                   |
| `notify_transporter.php`    | Envoi échoue silencieusement                  | Ajouter log erreur + fallback e-mail               |

---

## 📄 Livrables attendus

Chaque module doit être livré avec :

* ✅ Code PHP fonctionnel et commenté
* ✅ Fichier de test unitaire associé
* ✅ Documentation dans `/docs/API_MISSIONS.md`
* ✅ Mise à jour de `phpunit.xml` si besoin
* ✅ Entrée dans le fichier `CHANGELOG.md` avec date et auteur

---

## 🗂 Structure de livraison

```
/php/
  ├── create_mission.php
  ├── update_mission_status.php
  ├── log_position.php
  ├── mission_summary.php
  └── notify_transporter.php

/config/
  └── database.php

/tests/
  ├── unit/
  │   └── MissionControllerTest.php
  └── e2e/
      └── MissionLifecycleTest.php

/docs/
  └── API_MISSIONS.md

.env.example
composer.json
phpunit.xml
CHANGELOG.md
```

---

## ⏱️ Échéance bloc PHP

📌 **Date limite de livraison complète** : `🗓 2 août 2025 à 18h GMT+0`  
📌 Tous les tests doivent passer en local ET sur le runner CI (voir cascade-runner config `.yaml`)

---

## ✅ Checklist pour Cascade

* [ ] Relecture des modules existants
* [ ] Implémentation des correctifs
* [ ] Ajout de validations et sécurisation des entrées
* [ ] Ajout ou correction des tests unitaires
* [ ] Mise en place du test E2E
* [ ] Vérification des logs et fallback
* [ ] Documentation API
* [ ] Mise à jour de `.env.example`
* [ ] Entrée dans `CHANGELOG.md`
* [ ] Push sur branche `feat/php-mission-tracker`
