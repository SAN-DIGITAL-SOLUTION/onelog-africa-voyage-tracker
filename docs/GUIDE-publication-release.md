# Guide de publication d’une release GitHub

## 1. Préparer les livrables
- Vérifier que le tag v1.0.0 est bien poussé sur le dépôt distant (`git tag` et `git push origin v1.0.0`).
- S’assurer que le fichier `CHANGELOG.md` est à jour et exhaustif.
- Générer une archive ZIP de la release :
  ```sh
  git archive -o onelog-africa-v1.0.0.zip v1.0.0
  ```

## 2. Créer la release sur GitHub
- Aller sur la page « Releases » du dépôt GitHub.
- Cliquer sur « Draft a new release ».
- Sélectionner le tag `v1.0.0`.
- Titre : `Release v1.0.0 – Profils, Facturation, QA, Sécurité`
- Description : copier le contenu de `CHANGELOG.md`.
- Joindre l’archive ZIP générée.
- Publier la release.

## 3. Diffuser l’annonce
- Envoyer un message à l’équipe (Slack, email, etc.) avec le lien vers la release et les notes de version.

---

*Pour les versions suivantes, répéter la procédure en adaptant le tag et le changelog.*
