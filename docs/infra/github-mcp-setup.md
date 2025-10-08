# GitHub MCP Server — Setup (Local Docker + Remote)

Ce guide explique comment configurer le GitHub MCP Server pour ce dépôt, en local (Docker) et en remote, et quels secrets créer dans GitHub.

## 1) Générer un Personal Access Token (PAT)
- Ouvrez: https://github.com/settings/tokens
- Créez un « Fine-grained personal access token » ou un « Classic PAT ».
- Scopes recommandés (minimum):
  - `repo` (accès lecture/écriture aux dépôts privés si nécessaire)
  - `workflow` (déclencher/lire les workflows)
  - `read:org` (si vous utilisez des organisations)
- Conservez la valeur du token en lieu sûr (ne le commitez jamais).

## 2) Utilisation Remote (VS Code MCP)
Le fichier de configuration VS Code `/.vscode/mcp.json` contient un serveur MCP remote:
- URL: `https://api.githubcopilot.com/mcp/`
- Header: `Authorization: Bearer ${input:github_token}`
- Lors du chargement, VS Code vous demandera `github_token` (saisi en mode secret).

## 3) Lancer la version Docker en local
Prérequis: Docker Desktop installé.

Commande:
```bash
docker run -i --rm \
  -e GITHUB_PERSONAL_ACCESS_TOKEN=YOUR_PAT \
  ghcr.io/github/github-mcp-server
```
- Remplacez `YOUR_PAT` par votre PAT (ne le stockez pas en clair dans le repo).
- Le serveur s’exécute en STDIN/STDOUT (mode MCP « command ») et peut être utilisé par des clients MCP compatibles.

## 4) Secrets GitHub à créer (Repository Settings > Secrets and variables > Actions)
Créez ces secrets:
- `GITHUB_PERSONAL_ACCESS_TOKEN` — PAT pour le MCP (scopes: `repo`, `workflow`, `read:org`).
- `GITHUB_TOOLSETS` — (optionnel) configuration JSON pour des intégrations avancées du MCP.
- `PROD_DEPLOY_KEY` — (placeholder) clé utilisée pour le déploiement production (ex: clé SSH, token provider, etc.).

## 5) Bonnes pratiques
- Ne jamais committer de secrets (PAT, clés, tokens) dans le dépôt.
- Préférer GitHub Secrets pour la CI/CD et les déploiements.
- Restreindre les scopes du PAT au strict nécessaire.
