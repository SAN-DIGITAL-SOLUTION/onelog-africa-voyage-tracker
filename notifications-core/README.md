# notifications-core

## 🛡️ Gouvernance & conformité

---

## 🔒 Audit de dépendances & sécurité

- **Mises à jour automatiques** : [Dependabot](https://docs.github.com/en/code-security/supply-chain-security/keeping-your-dependencies-updated-automatically) surveille les dépendances et propose des PR de sécurité chaque semaine.
- **Analyse de vulnérabilités** : badge Snyk ci-dessus (lien vers le scan public du repo). Pour activer Snyk, connecte ton repo sur [snyk.io](https://snyk.io/).
- **Bonnes pratiques** : ne jamais merger une PR de dépendance si le badge Snyk est rouge ou si Coveralls signale une baisse de couverture critique.

- [Politique de confidentialité Afrique (PRIVACY.md)](./PRIVACY.md)
- [Politique de confidentialité UE/RGPD (RGPD.md)](./RGPD.md)
- [Politique de sécurité (SECURITY.md)](./SECURITY.md)
- [Guide de contribution (CONTRIBUTING.md)](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)
- Workflows CI/CD : sécurité, audit, changelog automatisé

> Ce module propose une double politique de confidentialité : Afrique (PRIVACY.md) et Union Européenne (RGPD.md). La politique la plus protectrice prévaut pour l’utilisateur.

![Badge RGPD](https://img.shields.io/badge/RGPD-conforme-green?style=flat-square)
[![npm version](https://img.shields.io/npm/v/notifications-core?style=flat-square)](https://www.npmjs.com/package/notifications-core)
[![Coverage Status](https://coveralls.io/repos/github/<owner>/<repo>/badge.svg?branch=main)](https://coveralls.io/github/<owner>/<repo>?branch=main)
[![Known Vulnerabilities](https://snyk.io/test/github/<owner>/<repo>/badge.svg)](https://snyk.io/test/github/<owner>/<repo>)
[![Uptime Robot status](https://img.shields.io/uptimerobot/status/m789123456-abcd1234ef)](https://uptimerobot.com/dashboard?monitors=789123456)

---

## 📦 Publication & installation

---

## 📚 Documentation API (Typedoc)

---

## 🌐 Monitoring & disponibilité

- Badge UptimeRobot ci-dessus : surveille la disponibilité du service ou de l’API (remplace l’ID par celui de ton monitor UptimeRobot).
- Pour configurer : crée un monitor HTTP(s) sur https://uptimerobot.com, copie l’ID du monitor, et adapte l’URL du badge.
- Dashboard public UptimeRobot possible pour l’équipe (optionnel).

La documentation API est générée automatiquement (npm run docs) et publiée gratuitement sur [Netlify](https://notifications-core-docs.netlify.app) (ou Vercel).

- Badge d’accès direct : [![API Docs](https://img.shields.io/badge/docs-typedoc-blue)](https://notifications-core-docs.netlify.app)
- Pour publier la doc : voir le guide [scripts/deploy-docs-netlify.md](./scripts/deploy-docs-netlify.md)
- **Conseil :** Évite d’utiliser GitHub Actions pour le déploiement afin de limiter la facturation.

Ce module est publié automatiquement sur [npmjs.com](https://www.npmjs.com/package/notifications-core) à chaque release GitHub.

Pour l’installer dans votre projet :

```bash
npm install notifications-core
```

Voir le changelog pour l’historique des versions et la documentation API pour l’intégration détaillée.


![Build Status](https://github.com/<owner>/<repo>/actions/workflows/publish-notifications-core.yml/badge.svg)
[![API Docs](https://img.shields.io/badge/docs-typedoc-blue)](https://notifications-core-docs.netlify.app)

<!-- Ajoute ici un badge de couverture si tu ajoutes un outil de coverage -->


**Module professionnel et réutilisable pour la gestion de notifications multicanal/multilingue dans tout projet Node.js, Supabase, Twilio, etc.**

## 🚀 Fonctionnalités principales
- Rendu dynamique de templates (WhatsApp, SMS, Email, etc.)
- Structure de templates flexible et paramétrable
- Génération automatique de templates pour tout événement/canal/langue
- Validation automatique des placeholders
- CLI prête à l'emploi (`generate`, `validate`)
- Fallback automatique si template manquant
- Intégration simple dans tout backend Node.js ou Supabase Edge
- Fonctionne en local, en CI/CD, ou sur runner custom (aucune dépendance imposée)

## 📦 Structure
```
notifications-core/
  templates/                  # Tous les templates (événement/canal/langue)
  templateEngine.ts           # Moteur de rendu
  notificationService.ts      # Service d'envoi (Twilio/Supabase)
  generate-templates.ts       # Génération automatique
  validate-templates.ts       # Validation automatique
  config.ts                   # Configuration (chemins, canaux, langues...)
  cli.js                      # CLI (bonus)
  README.md                   # Ce guide
  web/                        # (Prévu) UI de gestion web des templates
```

## ⚙️ Configuration
- Modifiez `config.ts` pour personnaliser les chemins, canaux, langues par défaut, etc.
- Ou utilisez des variables d'environnement (`NOTIFCORE_TEMPLATES_PATH`, ...)

## 🛠️ Commandes principales
- Générer des templates :
  ```bash
  npx ts-node notifications-core/generate-templates.ts --event order/shipped --channels whatsapp,sms,email --langs fr,en
  ```
- Valider tous les templates :
  ```bash
  npx ts-node notifications-core/validate-templates.ts
  ```

## 🧑‍💻 Exemple d'intégration
```ts
import { TemplateEngine } from 'notifications-core/templateEngine';
const msg = TemplateEngine.render('order/shipped', 'email', 'en', {
  clientName: 'Alice',
  orderId: 'A123',
  date: '2025-06-23'
});
console.log(msg);
```

## 🔗 Intégration dans un backend Supabase Edge
- Importez le moteur et utilisez-le dans vos fonctions Edge pour générer le contenu à envoyer par Twilio/Supabase.

## 🌍 Ajouter un événement, une langue ou un canal
- Utilisez la commande `generate-templates` avec les paramètres souhaités
- Les nouveaux fichiers sont créés automatiquement dans `templates/`

## 🏗️ Déploiement et publication
- Peut être utilisé comme dossier local, ou publié sur un registre npm privé
- CLI bonus : `npx notifications-cli ...` (prévu)

## 🛡️ Contraintes respectées
- Aucune dépendance obligatoire à GitHub Actions
- Fallback automatique si template absent
- Log clair pour la validation
- Prêt pour une UI web de gestion

## 📚 Pour aller plus loin
- Voir chaque fichier pour l’API détaillée et les exemples
- Adaptez la structure à vos besoins métier (événements libres, canaux/langues dynamiques)
