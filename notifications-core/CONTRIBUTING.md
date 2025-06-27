# Guide de contribution - notifications-core

Merci de contribuer à notifications-core ! Pour garantir la qualité, la sécurité et la cohérence du module, merci de respecter les règles suivantes :

## Workflow de contribution
- Forkez le dépôt puis créez une branche dédiée à votre fonctionnalité ou correctif.
- Ouvrez une Pull Request (PR) claire et détaillée : objectif, changements principaux, impact potentiel.
- Toute PR doit être relue et validée par au moins un mainteneur.
- Les tests, la documentation et la sécurité doivent être vérifiés avant merge.

## Conventions de commit
- Utilisez le format [type]: [sujet] (ex : feat: ajout upload template, fix: correction auth admin).
- Types courants : feat, fix, docs, refactor, test, chore, ci.
- Les messages doivent être concis et explicites.

## Bonnes pratiques de sécurité
- Ne jamais commiter de secrets, mots de passe ou données sensibles.
- Respecter les politiques de sécurité (voir SECURITY.md).
- Vérifier les vulnérabilités (`npm audit`) avant toute release.

## Documentation
- Toute nouvelle fonctionnalité doit être documentée dans le README ou un fichier dédié.
- Les workflows, scripts ou API modifiés doivent être expliqués.

## Tests
- Ajouter des tests unitaires/fonctionnels pour tout nouveau code critique.
- Vérifier que la CI passe avant de demander une revue.

## Contact
Pour toute question : ouvrez une issue ou contactez un mainteneur du projet.
