# Publication de la documentation API sur Netlify (méthode manuelle/gratuite)

## 1. Générer la documentation localement

Dans le dossier notifications-core :

```bash
npm run docs
```

La documentation HTML sera générée dans `notifications-core/docs/api`.

## 2. Publier la documentation sur Netlify

- Crée un compte gratuit sur https://www.netlify.com
- Clique sur "Add new site" > "Import an existing project"
- Sélectionne le dossier `notifications-core/docs/api` comme dossier de publication ("Publish directory")
- Configure le build command sur `npm run docs` ou laisse vide si tu uploades manuellement
- Termine la configuration et récupère l’URL publique Netlify (ex : https://notifications-core-docs.netlify.app)

**Option alternative :**
- Utilise la Netlify CLI pour déployer en ligne de commande :

```bash
npm install -g netlify-cli
netlify deploy --dir=docs/api --prod
```

## 3. Mettre à jour le README

Ajoute un badge API Docs et le lien Netlify :

```markdown
[![API Docs](https://img.shields.io/badge/docs-typedoc-blue)](https://notifications-core-docs.netlify.app)
```

## 4. Conseils
- Ne pas utiliser GitHub Actions pour déployer sur GitHub Pages afin d’éviter la facturation.
- La publication sur Netlify est gratuite dans la limite du plan Free.
- Pour automatiser, tu pourras plus tard utiliser Netlify Deploy Hooks ou Vercel CLI.

---

*Pour toute question, voir la section "Publication & installation" du README ou contacter un mainteneur.*
