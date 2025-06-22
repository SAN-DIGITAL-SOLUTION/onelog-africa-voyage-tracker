# 🚚 OneLog Africa – Suivi du Développement

![E2E Tests](https://github.com/sergeahiwa/OneLogAfrica/actions/workflows/e2e-ci.yml/badge.svg)
[![E2E Report](https://img.shields.io/badge/E2E%20Report-HTML-blue?logo=githubpages)](https://sergeahiwa.github.io/OneLogAfrica/mochawesome-report.html)

<p align="center">
  <img src="public/onelog-africa-logo-transparent.png" alt="Logo OneLog Africa (fond transparent)" width="180"/>
</p>

---

## 🚀 **Annonce officielle – Version 1.0.0 livrée !**

- La version **v1.0.0** de OneLog Africa est officiellement livrée : modules Profils, Facturation, Notifications, Tracking, QA et sécurité validés.
- Consultez le [CHANGELOG.md](CHANGELOG.md) pour le détail des livraisons.
- La **roadmap v1.1.0** est lancée : priorités UX, performance, avatars dynamiques, historique, etc. ([ROADMAP.md](ROADMAP.md))
- Contribuez ou suivez l’évolution en temps réel via les issues et le suivi projet.

---

<p align="center">
  <img src="public/onelog-africa-logo-whitebg.png" alt="Logo OneLog Africa (fond blanc)" width="180"/>
</p>

> Logos disponibles dans `/public` :
> - [Logo fond transparent](public/onelog-africa-logo-transparent.png)
> - [Logo fond blanc](public/onelog-africa-logo-whitebg.png)

OneLog Africa est une plateforme logistique panafricaine innovante. Ce document fournit un aperçu du développement actuel, des fonctionnalités livrées, des éléments en cours et des prochaines étapes.

---
## ✅ Avancement Global : **80 %**

---
## 🧩 État par module
###  Landing Page
- **Statut** : done
- **Détails** : Tous les composants sont présents et fonctionnels.
---
###  Authentification
- **Statut** : done
- **Détails** : Supabase Auth avec gestion des rôles et protection des routes.
---
###  Base de données
- **Statut** : done
- **Détails** : 7 tables principales migrées et utilisées dans le code.
---
###  Infrastructure
- **Statut** : done
- **Détails** : Stack technique installée, edge functions et clustering Google Maps opérationnels.
---
###  Application SaaS
- **Statut** : in_progress
- **Détails** :
  - Exports PDF/CSV opérationnels
  - Système de notifications en cours
  - Refonte du footer terminée
  - Tracking des missions intégré
---
###  Tests et documentation
- **Statut** : in_progress
- **Détails** :
  - Documentation technique en cours
  - Tests unitaires à compléter
---
## 💶 Module Facturation

- Affichage, export PDF/CSV et envoi email des factures
- Source : table Supabase `invoices`
- Voir la documentation complète : [docs/factures-doc.md](docs/factures-doc.md)

## 📍 Prochaines étapes
1. Finaliser la logique métier pour les missions
2. Terminer l'intégration du système de notifications
3. Compléter la facturation (UI + logique)
4. Développer la gestion des profils utilisateurs
5. Finaliser les tests unitaires avec Vitest/Jest
6. Compléter la documentation technique
7. Préparer la phase de QA et de tests utilisateurs
---
## 🧭 Suivi automatique
Ce fichier est généré à partir d’un modèle JSON de suivi de projet. Il peut être mis à jour automatiquement à l’aide d’un script d’analyse du code + fichiers Supabase.

---
