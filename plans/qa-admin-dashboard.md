# Fiche QA Fonctionnelle - Dashboard Exploitant/Admin (OneLog Africa)

---

### ✅ Objectif

Vérifier toutes les fonctionnalités du tableau de bord exploitant/admin (rôle = `admin`) via tests manuels et automatisés. Cette fiche couvre :

* La supervision des utilisateurs et missions
* Les droits d'accès et rôles
* La gestion des factures
* L'accès sécurisé (RLS, redirections, protection routes)

---

### 🔢 Scénarios principaux

| ID        | Scénario                          | Rôle               | Données test                                   | Attendu                             |
| --------- | --------------------------------- | ------------------ | ---------------------------------------------- | ----------------------------------- |
| QA-ADM-01 | Connexion en tant qu'admin        | admin              | email: admin@test.com                          | Accès au dashboard admin            |
| QA-ADM-02 | Visualiser liste des utilisateurs | admin              | 3 utilisateurs de rôles différents             | Affichage de tous les profils       |
| QA-ADM-03 | Visualiser liste des missions     | admin              | 5 missions actives                             | Affichage missions avec statut      |
| QA-ADM-04 | Visualiser factures               | admin              | 2 factures validées                            | Affichage n°, montant, date         |
| QA-ADM-05 | Modifier le rôle d’un utilisateur | admin              | userId: 123                                    | Changement de rôle effectif         |
| QA-ADM-06 | Redirection si non admin          | client / chauffeur | login + tentative accès /admin                 | Redirection vers /dashboard + toast |
| QA-ADM-07 | RLS utilisateurs                  | admin              | userId != current                              | Peut lire tous les profils          |
| QA-ADM-08 | RLS missions                      | admin              | missionId != current                           | Peut lire toutes les missions       |

---

### 💡 QA Technique supplémentaire

* **Protection des routes** : `RequireAuth(role='admin')`
* **Vérification UI responsive** sur mobile et tablette
* **Toast/Feedback utilisateur** lors des actions sensibles (modération, suppression)
* **Tests Cypress prévus** : login, listing utilisateurs, listing missions, filtrage par rôle
* **Tests Vitest** : services d’accès `getAllUsers`, `getAllMissions`, `updateUserRole`

---

### ⚠️ Points critiques à surveiller

* Aucun accès au dashboard admin ne doit être possible sans rôle `admin`
* Les modérations doivent être historisées (TODO : logs ou notification)
* Les données listées doivent être paginées (sinon backlog)
* Les politiques RLS doivent être testées manuellement et via script `audit_rls.sql`

---

✉️ Mise à jour prévue : à chaque nouvelle fonctionnalité admin ou push sur `main`

Fin de la fiche QA
