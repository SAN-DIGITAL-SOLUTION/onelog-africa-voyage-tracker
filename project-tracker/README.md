# 📦 project-tracker

Système modulaire de génération de README, rapports HTML et PDF à partir d’un fichier JSON de suivi projet.

## 🚀 Installation (version package Python)

1. **Copiez le dossier `project-tracker` dans votre projet**
2. (Optionnel) Installez-le en mode editable :
   ```bash
   pip install -e ./project-tracker
   ```
   ou via `pip install .` si vous le publiez sur PyPI
3. Installez les dépendances :
   ```bash
   pip install markdown weasyprint jsonschema
   ```

## ⚡ Utilisation rapide

- **Initialiser dans un nouveau projet** :
  ```bash
  readmegen init
  # ou
  python -m project_tracker.scripts.cli init
  ```
- **Générer le README, HTML, PDF** :
  ```bash
  readmegen build --json project-status.json --readme README.md --template project-tracker/templates/readme_template.md --html project-report.html --pdf project-report.pdf
  ```
- **Valider le JSON** :
  ```bash
  readmegen validate --json project-status.json --schema project-tracker/project-status.schema.json
  ```

## 🪝 Automatisation

- **Hook pre-commit** :
  Copiez le hook adapté (`hooks/pre-commit` ou `.bat`) dans `.git/hooks/` de votre repo.
- **GitHub Actions** :
  Ajoutez le workflow fourni dans `.github/workflows/update-readme.yml` (modifiez les chemins si besoin).

## 📂 Structure recommandée

```
project-tracker/
├── scripts/
│   ├── generate-readme.py
│   └── cli.py
├── templates/
│   └── readme_template.md
├── example.project-status.json
├── project-status.schema.json
├── hooks/
│   ├── pre-commit
│   └── pre-commit.bat
```

## 🧩 Personnalisation
- Modifiez `readme_template.md` pour votre style.
- Adaptez le schéma JSON si besoin.
- Ajoutez vos propres modules dans le JSON.

## 📖 Exemple minimal

```json
{
  "project": "Nom du projet",
  "description": "Courte description du projet.",
  "progression": 42,
  "modules": [
    { "name": "Backend", "status": "done", "progress": 100, "details": "API REST complète." }
  ],
  "missing_files": ["roadmap.md"],
  "next_steps": ["Compléter la documentation."]
}
```

## 🏆 Pour aller plus loin
- Publiez ce module sur PyPI pour un usage universel !
- Ajoutez des templates pour d’autres fichiers (CHANGELOG, CONTRIBUTING, etc.)
- Déployez une démo sur un repo public pour onboarding instantané.

---

*Made with ❤️ for industrialisation documentaire.*
