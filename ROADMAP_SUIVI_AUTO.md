# 🚦 Suivi Automatisé — Roadmap OneLog Africa

## 📊 Table de Suivi Priorisé

|  Priorité  | Module / Objectif                              | Action concrète                                                                                          | Responsable       | Échéance   | Statut      | Dernière maj | Commentaire                  |
| :--------: | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------- | ---------- | ----------- | -------------| ---------------------------- |
|  🟢 Haute  | **RBAC & Authentification** | • Migrations SQL & Policies RLS livrées (tables, policies, RLS sur users/missions/notifications/notification_preferences/roles/user_roles/permissions) | Cascade (IA)      | 2 jours    | ✅ Livré     | 2025-06-26    | Livraison atomique, script prêt à appliquer |
|  🟢 Haute  | **StepIndicator (barre de progression)** | • Composant multi-étapes industrialisé, intégré (onboarding, missions, notifications), doc et tests en place | Cascade (IA)      | 1 jour     | ✅ Livré     | 2025-06-27    | Réutilisable sur tout workflow |
|  🟢 Haute  | **Notifications temps réel (Supabase)** | • Suivi live des événements, dashboard admin dynamique, badge/popup UI, logs live, filtrage RBAC | Cascade (IA)      | 3 jours    | ⏳ En cours  | 2025-06-26    | Bloc prioritaire ouvert |
|  🔴 Haute  | **Tests E2E Mobile & Accessibilité**           | • Créer scénarios Cypress sur émulateur mobile<br>• Ajouter tests clavier a11y (axe)                     | QA / Dev Front    | 10 jours   | ⏳ En cours  | 2025-06-23    | Scénarios desktop OK         |
|  🔴 Haute  | **Notifications temps réel**                   | • Mettre en place Supabase Realtime<br>• Ajouter webhooks Twilio status callbacks<br>• Tester E2E        | Dev Notifications | 2 semaines | ⏳ En cours  | 2025-06-23    | Webhooks partiels            |
| 🔵 Moyenne | **Internationalisation (i18n)**                | • Extraire textes statiques<br>• Configurer next-i18next ou react-intl<br>• Traduire FR/EN               | Dev Frontend      | 2 semaines | 🕒 À démarrer | —            | —                           |
| 🔵 Moyenne | **Responsive & Dark Mode**                     | • Tester sur mobiles/tablettes<br>• Ajuster breakpoints et styles CSS variables<br>• Ajouter toggle mode | UI/UX Dev         | 2 semaines | 🕒 À démarrer | —            | —                           |
| 🟠 Moyenne | **Monitoring & Alertes CI**                    | • Fiabiliser workflows GitHub (artefacts, notifications Slack)<br>• Ajouter badge uptime API             | Dev DevOps        | 1 semaine  | ⏳ En cours  | 2025-06-23    | Workflows présents           |
|  🟢 Basse  | **Documentation CI/CD & Badges**               | • Mettre à jour README principal avec badge coverage, docs, monitoring<br>• Automatiser reporting        | Tech Writer       | 1 semaine  | ⏳ En cours  | 2025-06-23    | README partiellement à jour  |
|  🟢 Basse  | **Publication / Export Reporting**             | • Script PDF/Notion du rapport d’avancement<br>• Automatiser mise à jour hebdo                           | Tech Lead         | 2 semaines | 🕒 À démarrer | —            | —                           |

---

## 🔄 Suivi automatique
- **Statut** : ⏳ En cours, 🕒 À démarrer, ✅ Terminé, ❌ Bloqué
- **Mise à jour** : Modifier la colonne "Statut" et "Dernière maj" à chaque point quotidien ou revue sprint.
- **Automatisation** : Prévoir un script Node.js/CI pour incrémenter les statuts selon les commits, issues fermées et succès CI/CD.

---

## [✓] Cron Fallback Notifications – Planifié
- Fréquence : toutes les 5 minutes
- Script : notify:retry
- Méthode : node-cron (local) ou crontab (prod)
- Objectif : exécution automatique des relances SMS/email

## 📅 Calendrier global

* **Semaine 1** : Contrôle d’accès, Monitoring & Alertes CI, Doc CI/CD
* **Semaine 2** : Tests E2E mobile & a11y, Notifications temps réel
* **Semaine 3** : Internationalisation, Responsive & Dark Mode
* **Semaine 4** : Publication reporting, stabilisation et buffer

---

## 🚀 Livraison notifications temps réel (Supabase Realtime + Twilio)

- ✅ Script `notify:deploy` automatisé (migration SQL, tests unitaires, tests E2E, vérification post-déploiement)
- 📌 Tests intégrés (unitaires + E2E)
- 🔐 Migration SQL automatisée

---

## 🔖 Instructions de suivi
- Mettre à jour ce fichier à chaque stand-up ou sprint review.
- Synchroniser avec le reporting CI/CD et les issues GitHub.
- Export possible en PDF/Notion via script automatisé.

---

*Dernière génération automatique : 2025-06-23*

## ⚠️ Blocage Cypress local – Environnement Windows

> **Problème :**
> Sur certains postes Windows, Cypress refuse de démarrer (erreur `bad option: --smoke-test` ou `--ping` injectée à l’exécutable) malgré purge du cache, réinstallation et rétrogradation de version. Origine : pollution externe (antivirus, hook, proxy, etc.), non liée au projet.
>
> **Solution :**
> - Utiliser le fichier `docker-compose.e2e.yml` pour exécuter les tests E2E dans un conteneur Linux (`cypress/included:13.7.3`).
> - Commande : `docker-compose -f docker-compose.e2e.yml up`
> - Résultats reproductibles, aucune dépendance système Windows, compatible CI/CD.

Pour toute industrialisation ou debug E2E, privilégier l’usage du conteneur Docker.
