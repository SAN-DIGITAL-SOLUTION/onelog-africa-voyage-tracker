# Scripts d'Automatisation OneLog Africa

Ce dossier contient les scripts d'automatisation pour la gestion de la roadmap et l'intégration avec GitHub et Notion.

## 📋 Scripts Disponibles

### `update-roadmap.js`
Synchronise la roadmap (`ROADMAP_SUIVI_AUTO.md`) avec les issues GitHub et met à jour le badge de progression.

**Utilisation :**
```bash
node scripts/update-roadmap.js
```

**Fonctionnalités :**
- Met à jour les statuts des tâches en fonction des issues GitHub
- Calcule et met à jour le badge de progression dans le README
- Commit et push automatique des changements

---

### `export-roadmap-notion.js`
Exporte la roadmap vers une base de données Notion.

**Prérequis :**
- Créer une base de données Notion avec les propriétés suivantes :
  - `Name` (titre)
  - `Tâches complétées` (nombre)
  - `Total des tâches` (nombre)
  - `Pourcentage` (nombre)

**Utilisation :**
```bash
node scripts/export-roadmap-notion.js
```

**Fonctionnalités :**
- Crée ou met à jour les pages Notion pour chaque section
- Synchronise les tâches avec leur statut
- Ajoute des liens vers les issues GitHub

---

## 🔧 Configuration

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# GitHub Configuration
GITHUB_TOKEN=votre_token_github

# Notion Configuration
NOTION_API_KEY=votre_cle_api_notion
NOTION_DATABASE_ID=id_de_votre_base_notion
NOTION_PARENT_PAGE_ID=id_page_parente_optionnel
```

## 🤖 Intégration Continue

Pour exécuter automatiquement ces scripts, ajoutez une tâche dans votre workflow GitHub Actions :

```yaml
- name: Mettre à jour la roadmap
  run: |
    npm ci
    node scripts/update-roadmap.js
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    NOTION_API_KEY: ${{ secrets.NOTION_API_KEY }}
    NOTION_DATABASE_ID: ${{ secrets.NOTION_DATABASE_ID }}
```

## 📊 Badge de Progression

Le badge de progression est automatiquement mis à jour par le script `update-roadmap.js` et affiche l'avancement global du projet basé sur les tâches complétées dans la roadmap.

```markdown
![Avancement](https://img.shields.io/static/v1?label=Avancement&message=0%25&color=informational&style=flat-square)
```

## 🔄 Planification

Pour une mise à jour régulière, configurez un job planifié dans GitHub Actions :

```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # Tous les jours à minuit
  workflow_dispatch:  # Permet un déclenchement manuel
```

## 📝 Notes

- Les scripts sont idempotents et peuvent être exécutés plusieurs fois sans effet secondaire
- Les logs détaillés sont affichés dans la console
- En cas d'erreur, le script s'arrête avec un code de sortie non nul
