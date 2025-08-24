# Règles Globales de Développement - OneLog Africa

## Principes Fondamentaux
1. **Code Propre** : Lisibilité avant tout, commentaires explicites, fonctions courtes et ciblées
2. **DRY** (Don't Repeat Yourself) : Pas de duplication de code
3. **KISS** (Keep It Simple, Stupid) : Solutions les plus simples possibles
4. **YAGNI** (You Aren't Gonna Need It) : Ne pas développer de fonctionnalités non nécessaires
5. **SOLID** : Principes de conception orientée objet respectés

## Plan d'Exécution Séquentiel - Méthodologie Cascade

### Avant de coder
- Établir un plan d'implémentation clair dans `plan.md`
- Décrire chaque bloc avant implémentation :
  - Rôle et objectifs
  - Dépendances techniques
  - Fichiers affectés
  - Tests à prévoir

### Pour chaque bloc de développement
1. **Objectifs**
   - Résumer les objectifs techniques et fonctionnels
   - Définir les critères d'acceptation

2. **Conception**
   - Proposer une solution avec explication claire
   - Justifier les choix d'architecture et techniques
   - Documenter les alternatives envisagées et rejetées

3. **Impacts**
   - Anticiper les impacts sur les blocs suivants
   - Identifier les risques potentiels
   - Prévoir les évolutions futures

4. **Documentation**
   - Documenter le raisonnement et les décisions
   - Maintenir un historique des modifications

### Livrables par bloc
- Résumé de décision technique
- Code propre et modulaire
- Tests unitaires et d'intégration
- Documentation intégrée (JSDoc/TSDoc, commentaires)
- Mise à jour de la documentation technique

## Code Qualité - Niveau Senior

### Standards de Code
- **Langage** : TypeScript (strict mode)
- **Style** : ESLint + Prettier configurés
- **Tests** : Minimum 80% de couverture de code
- **Documentation** : JSDoc/TSDoc pour les fonctions complexes

### Règles de Qualité
- **Nommage**
  - Noms clairs et explicites pour variables, fonctions, fichiers
  - Utilisation de verbes pour les fonctions, noms pour les variables
  - Cohérence dans la convention de nommage

- **Architecture**
  - Séparation claire entre logique métier, affichage et accès aux données
  - Structure modulaire et réutilisable
  - Éviter la duplication de code (privilégier la composition)
  - Principe de responsabilité unique

- **Documentation**
  - Commentaires utiles pour les parties complexes
  - Documentation des comportements attendus
  - Mention des limites connues
  - Exemples d'utilisation si nécessaire

- **Maintenabilité**
  - Code lisible plutôt que concis mais obscur
  - Architecture pensée et documentée
  - Prévoir l'évolutivité
  - Gestion propre des erreurs
- **Conventions de nommage** : 
  - Composants : PascalCase (ex: `UserProfile.tsx`)
  - Fichiers utilitaires : camelCase (ex: `dateUtils.ts`)
  - Constantes : UPPER_SNAKE_CASE
  - Interfaces : préfixe `I` (ex: `IUser`)
  - Types : suffixe `Type` (ex: `UserType`)

## Gestion des Dépendances
- Toujours utiliser la dernière version stable des dépendances
- Vérifier les vulnérabilités avec `npm audit`
- Documenter toute dépendance critique dans le README
- Éviter les dépendances inutiles

## Peer Review Automatisé

Avant de finaliser un bloc, effectuer une auto-évaluation :

### Cohérence Produit
- La solution répond-elle aux objectifs initiaux ?
- Est-elle cohérente avec la vision produit ?
- Respecte-t-elle les standards établis ?

### Qualité du Code
- Le code serait-il accepté par une équipe senior ?
- Est-il lisible et compréhensible ?
- Les noms sont-ils explicites ?
- La complexité est-elle maîtrisée ?

### Maintenabilité
- Le code est-il facilement maintenable ?
- Les dépendances sont-elles bien gérées ?
- La solution est-elle évolutive ?
- Les tests sont-ils suffisants ?

### Documentation
- Le code est-il correctement documenté ?
- Les décisions techniques sont-elles justifiées ?
- Les limites sont-elles documentées ?

### Exemple de Synthèse de Review
"Cette implémentation respecte les principes SOLID, la logique est bien testée de manière indépendante, et les noms choisis sont explicites. La séparation des préoccupations est respectée avec une architecture claire. On pourrait envisager une optimisation des requêtes dans une prochaine itération."

## Gestion des Branches Git
- `main` : Branche de production
- `staging` : Branche de pré-production
- `feat/*` : Nouvelles fonctionnalités
- `fix/*` : Corrections de bugs
- `docs/*` : Documentation
- `refactor/*` : Refactorisation de code

## Revue de Code
- Toute modification doit passer par une Pull Request
- Minimum 1 approbation requise avant fusion
- Les tests doivent tous passer
- La couverture de code doit être maintenue

## Sécurité
- Aucun secret dans le code source
- Validation des entrées utilisateur
- Protection contre les attaques XSS, CSRF, injection
- Authentification et autorisation systématiques

## Performance
- Temps de chargement < 2 secondes
- Taille du bundle JavaScript < 500KB
- Optimisation des images et assets
- Mise en cache appropriée

## Accessibilité (a11y)
- Respect du WCAG 2.1 niveau AA
- Navigation au clavier fonctionnelle
- Contraste des couleurs suffisant
- Attributs ARIA appropriés

## Internationalisation (i18n)
- Tous les textes dans des fichiers de traduction
- Support du RTL si nécessaire
- Gestion des fuseaux horaires et formats de date

## Tests
- Tests unitaires : Vitest
- Tests E2E : Cypress
- Tests d'intégration : Vitest + MSW
- Couverture minimale : 80%
- Tests critiques : 100% de couverture

## Documentation
- README complet et à jour
- Documentation technique (JSDoc/TSDoc)
- Guide de démarrage rapide
- Dépannage (troubleshooting)
- Changelog maintenu

## Déploiement
- CI/CD automatisé
- Environnements séparés (dev, staging, prod)
- Rollback automatisé en cas d'échec
- Surveillance (monitoring) en place

## Maintenance et Amélioration Continue
- Mises à jour de sécurité appliquées dans les 48h
- Documentation mise à jour systématiquement avec le code
- Revue trimestrielle de l'architecture
- Rétrospective après chaque version majeure
- Veille technologique régulière

## Adaptabilité et Alignement Continu

### Outils de Suivi
- `reset-directionnel.md` : Pour recadrer l'orientation si nécessaire
- `issue-tracker.md` : Suivi des retours, erreurs et questions
- `sync-log.md` : Journalisation des livraisons et modifications
- `roadmap.md` : Mise à jour continue de la feuille de route

### Processus d'Amélioration
1. **Feedback Utilisateur**
   - Collecter et analyser les retours
   - Prioriser les améliorations

2. **Revue Continue**
   - Évaluer régulièrement l'alignement avec les objectifs
   - Ajuster la trajectoire si nécessaire

3. **Documentation Évolutive**
   - Maintenir à jour la documentation
   - Archiver les décisions importantes

4. **Rétrospectives**
   - Analyser les succès et échecs
   - Identifier les axes d'amélioration
   - Mettre à jour les processus en conséquence
