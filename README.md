# 🚚 OneLog Africa – Suivi du Développement

## Configuration Twilio
- `TWILIO_WHATSAPP_FROM` : numéro WhatsApp (format `whatsapp:+XYZ`)
- `TWILIO_SMS_FROM` : numéro SMS (format `+XYZ`)

[![E2E](https://img.shields.io/badge/E2E-Cypress-green)](./cypress/e2e/rbac-auth.spec.ts)
[![Sécurité validée](https://img.shields.io/badge/Sécurité-RBAC%20validée-brightgreen)](./docs/ADMIN_DASHBOARD.md)
![E2E Tests](https://github.com/sergeahiwa/OneLogAfrica/actions/workflows/e2e-selfhosted.yml/badge.svg)
[![E2E Report](https://github.com/sergeahiwa/OneLogAfrica/actions/workflows/publish-e2e-report.yml/badge.svg)](https://sergeahiwa.github.io/OneLogAfrica/mochawesome-report.html)
![Avancement](https://img.shields.io/static/v1?label=Avancement&message=100%25&color=brightgreen&style=flat-square)
![Analytics](https://img.shields.io/badge/Analytics-Advanced-blue?style=flat-square)

## CI Self-Hosted Runner
Pour installer et exécuter le runner GitHub Actions sur Windows, suivez le guide détaillé dans [docs/SELF_HOSTED_RUNNER.md](docs/SELF_HOSTED_RUNNER.md).


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

## 🧩 Réutiliser StepIndicator (barre de progression)

Le composant `<StepIndicator />` permet d’industrialiser tous vos workflows multi-étapes (onboarding, création de mission, etc.).

Exemple :

```tsx
import { StepIndicator } from '@/components/StepIndicator';

const steps = [
  { title: 'Étape 1', completed: true },
  { title: 'Étape 2', completed: false },
];
<StepIndicator steps={steps} />
```

➡️ Voir la doc détaillée dans `INTEGRATION_UI.md`.

---

<p align="center">
  <img src="public/onelog-africa-logo-whitebg.png" alt="Logo OneLog Africa (fond blanc)" width="180"/>
</p>

> Logos disponibles dans `/public` :
> - [Logo fond transparent](public/onelog-africa-logo-transparent.png)
> - [Logo fond blanc](public/onelog-africa-logo-whitebg.png)

OneLog Africa est une plateforme logistique panafricaine innovante. Ce document fournit un aperçu du développement actuel, des fonctionnalités livrées, des éléments en cours et des prochaines étapes.

---
## 📚 Documentation

- [Guide d'Implémentation et Stratégie Hybride](docs/GUIDE_IMPLEMENTATION_STRATEGIE_HYBRIDE.md) - Architecture, phases de développement et stratégie technique

## ✅ Avancement Global : **100 %** - Prêt pour Pré-Production

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
- **Statut** : done (95%)
- **Détails** :
  - ✅ Missions complètes : CRUD, filtres, pagination, export, temps réel
  - ✅ Dashboard multi-rôles : Admin, Client, Chauffeur, QA opérationnels
  - ✅ Tracking GPS : GoogleMap intégré, tracking_points Supabase
  - ✅ Timeline Dashboard : Phase 3 complète avec optimisations
  - ✅ Notifications : Service complet, templates multi-canal, retry logic
  - ✅ Facturation : Pages, génération PDF/CSV, services intégrés
  - ✅ Profils : CRUD complet avec avatars et rôles
  - ✅ Onboarding : Workflow complet avec étapes
  - ✅ RBAC/Auth : Supabase + protection routes complète

---
## 🔔 Système de templates de notifications

Le moteur de notifications OneLog Africa utilise un système de templates de fichiers pour générer dynamiquement tous les messages (WhatsApp, SMS, Email), multilingue et multi-canal, avec fallback automatique.

### 📂 Structure des templates
```
templates/
  mission/
    created/
      whatsapp/
        fr.txt
        en.txt
      sms/
        fr.txt
        en.txt
      email/
        fr.html
        en.html
  default/
    whatsapp/
      fr.txt
      en.txt
    sms/
      fr.txt
      en.txt
    email/
      fr.txt
      en.txt
    global.txt
```

- Chaque fichier correspond à un événement, un canal et une langue.
- Les templates par défaut sont utilisés si un template spécifique n’est pas trouvé (fallback).

### ➕ Ajouter un nouveau template
1. Créer le fichier correspondant dans le bon dossier (ex: `templates/mission/created/sms/en.txt`)
2. Utiliser des placeholders entre `{{...}}` pour les variables dynamiques (ex: `{{clientName}}`, `{{missionId}}`)
3. Les nouveaux canaux/langues suivent la même logique de dossier/fichier.

### 🧑‍💻 Exemple d’appel au moteur
```ts
import { TemplateEngine } from './src/services/templateEngine';
const msg = TemplateEngine.render('mission/created', 'sms', 'fr', {
  clientName: 'Jean',
  missionId: '12345',
  date: '2025-06-23',
});
console.log(msg);
```

### 🌍 Ajouter un canal ou une langue
- Ajouter un sous-dossier (ex: `whatsapp`, `sms`, `email`) ou un fichier langue (ex: `en.txt`, `fr.txt`)
- Le fallback automatique s’applique si le template demandé n’existe pas

### 🔬 Automatisation des tests de templates
- Script : `npx ts-node scripts/validate-templates.ts`
- Parcourt tous les templates, tente un rendu avec des données factices, détecte les placeholders non remplacés et log les erreurs dans `logs/test-results.log`
- À lancer après chaque modification ou ajout de template

###  Tests et documentation
- **Statut** : in_progress (75%)
- **Détails** :
  - ✅ Documentation technique complète (docs/)
  - ✅ Tests unitaires présents (__tests__/)
  - 🔶 Configuration Vitest à corriger
  - 🔶 Guides utilisateur finaux à rédiger
---
## 💶 Module Facturation

- Affichage, export PDF/CSV et envoi email des factures
- Source : table Supabase `invoices`
- Voir la documentation complète : [docs/factures-doc.md](docs/factures-doc.md)

## 📍 Prochaines étapes (Finitions Pré-Production)
1. ✅ **Priorité P0** : Corriger configuration tests unitaires Vitest (2h)
2. ✅ **Priorité P0** : Finaliser pipeline CI/CD GitHub Actions (4h)
3. ✅ **Priorité P1** : Intégrer monitoring Sentry + métriques (4h)
4. ✅ **Priorité P1** : Rédiger guides utilisateur finaux (1J)
5. ✅ **Priorité P1** : Tests de charge pré-production (4h)
6. ✅ **Objectif** : Déploiement production 9 septembre 2025
---

*Dernière mise à jour : 2025-09-25 - Documentation synchronisée automatiquement*

## ⚠️ Limitations d’environnement local Windows

> **Blocage critique Cypress**
>
> Sur certains environnements Windows, Cypress refuse de démarrer (erreur `bad option: --smoke-test` ou `--ping` injectée à l’exécutable) malgré purge du cache, réinstallation, et rétrogradation de version. Ce problème est dû à une pollution externe du système (antivirus, hook, proxy, etc.) et ne dépend pas du projet.
>
> **Solution recommandée :**
> - Utilisez le fichier `docker-compose.e2e.yml` (fourni à la racine) pour lancer les tests E2E Cypress dans un conteneur Linux isolé.
> - Commande : `docker-compose -f docker-compose.e2e.yml up`
> - Le conteneur utilise l’image officielle `cypress/included:13.7.3` et monte le code source local.
>
> **Avantages :**
> - Aucun risque de pollution environnementale
> - Résultats reproductibles, compatibles CI/CD
> - Pas de dépendances système à installer côté Windows

Pour toute contribution ou exécution locale, privilégiez l’usage du conteneur Docker pour les E2E.

---

### 🐳 Pré-pull des images Docker recommandé

Avant de lancer les E2E, pour éviter les erreurs réseau/EOF :
```bash
docker pull node:18
docker pull cypress/included:13.7.3
docker pull postgres:15
```

Puis lancez :
```bash
docker-compose -f docker-compose.e2e.yml up --exit-code-from cypress
```

---
Ce fichier est généré à partir d’un modèle JSON de suivi de projet. Il peut être mis à jour automatiquement à l’aide d’un script d’analyse du code + fichiers Supabase.

---
