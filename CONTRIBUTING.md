# Guide de Contribution OneLog Africa

## 🚀 Méthode de Développement IA-FIRST

OneLog Africa suit une approche de développement **IA-FIRST** (Identify → Analyze → Fix → Iterate → Review → Ship) pour une livraison continue et automatisée.

### Principes Clés

1. **Porté par un non-codeur** : Le développement est piloté par des objectifs métier, pas par des contraintes techniques.
2. **Délégation complète** : L'IA gère l'implémentation de bout en bout.
3. **Zéro validation intermédiaire** : Les tâches validées sont exécutées sans approbation manuelle.
4. **Exécution autonome** : L'IA gère les dépendances, les tests et la documentation.

### Workflow Type

1. **Identify** : Analyse des besoins et des tâches
2. **Analyze** : Revue du code existant et des dépendances
3. **Fix/Implement** : Développement des fonctionnalités
4. **Iterate** : Amélioration continue basée sur les retours
5. **Review** : Vérification automatique de la qualité
6. **Ship** : Déploiement et documentation

## 📦 Structure des Dossiers

```
/
├── .windsurf/           # Fichiers de gouvernance et templates
│   ├── policies/        # Règles globales et politiques
│   └── templates/       # Modèles de documents
├── docs/                # Documentation du projet
│   ├── api/             # Documentation des API
│   ├── qa/              # Documentation des tests qualité
│   ├── security/        # Politiques et guides de sécurité
│   └── ...
├── src/                 # Code source
│   ├── components/      # Composants réutilisables
│   ├── pages/           # Pages de l'application
│   ├── services/        # Services et logique métier
│   └── ...
└── tests/              # Tests automatisés
    ├── unit/           # Tests unitaires
    └── e2e/            # Tests de bout en bout
```

## 🔧 Hooks Git

Des hooks Git sont configurés pour maintenir la qualité du code. Ils s'exécutent automatiquement lors de certaines actions Git.

### Hooks Configurés

1. **pre-commit**
   - Vérifie le format des noms de fichiers
   - Assure que seuls les caractères autorisés sont utilisés (lettres, chiffres, points, tirets, tirets bas)

2. **commit-msg**
   - Vérifie que le message de commit n'est pas vide
   - Vérifie que le message fait au moins 10 caractères

3. **pre-push**
   - Exécute les tests avant le push
   - Vérifie l'absence de marqueurs TODO/FIXME dans le code

### Comment Tester les Hooks

1. **Tester le hook pre-commit** :
   ```bash
   # Créer un fichier avec un nom invalide
   touch "fichier avec espaces.js"
   git add "fichier avec espaces.js"
   git commit -m "Test pre-commit hook"
   # Devrait échouer à cause des espaces dans le nom du fichier
   ```

2. **Tester le hook commit-msg** :
   ```bash
   git commit --allow-empty -m "Trop court"
   # Devrait échouer car le message fait moins de 10 caractères
   ```

3. **Tester le hook pre-push** :
   ```bash
   # Créer un fichier avec un TODO
   echo "// TODO: À implémenter" > test.js
   git add test.js
   git commit -m "Test du hook pre-push"
   git push
   # Devrait échouer à cause du marqueur TODO
   ```

### Personnalisation

Les hooks peuvent être personnalisés en modifiant les fichiers correspondants dans le dossier `.git/hooks/`. Les modifications seront conservées car ces fichiers ne sont pas suivis par Git.

### Désactivation Temporaire

Pour désactiver temporairement un hook :
```bash
chmod -x .git/hooks/nom-du-hook
```

Pour le réactiver :
```bash
chmod +x .git/hooks/nom-du-hook
```

## 📚 Documentation

### Structure de Documentation

1. **Documentation Technique**
   - `API_REFERENCE.md` : Documentation complète des endpoints API
   - `ARCHITECTURE.md` : Vue d'ensemble de l'architecture
   - `DEPLOYMENT.md` : Guide de déploiement

2. **Sécurité**
   - `security/SECURITY_GUIDELINES.md` : Directives de sécurité
   - `security/INCIDENT_RESPONSE.md` : Procédures de réponse aux incidents

3. **Qualité et Tests**
   - `qa/TEST_STRATEGY.md` : Stratégie de test
   - `qa/QA_*.md` : Plans de test par module

### Standards de Documentation

- **Code** : Documentation en anglais avec JSDoc/TSDoc
- **APIs** : Spécification OpenAPI 3.0
- **Changements** : Suivi dans `CHANGELOG.md`
- **Décisions** : Documents ADR (Architecture Decision Records)

## 🧪 Tests

### Types de Tests

| Type          | Outil       | Couverture Cible | Exécution           |
|---------------|-------------|------------------|---------------------|
| Unitaires     | Vitest      | ≥ 80%            | Pré-commit          |
| Composants    | React Testing Library | 100%  | CI/CD           |
| E2E           | Cypress     | Scénarios clés   | Nuit/CI             |
| Performance   | Lighthouse  | Score > 90       | Hebdomadaire        |
| Sécurité      | OWASP ZAP   | Aucune vulnérabilité critique | Mensuel |

## 🔄 Intégration Continue

### Pipeline CI/CD

1. **Vérification du code**
   - Linting (ESLint, Stylelint)
   - Analyse statique (TypeScript, SonarQube)
   - Tests unitaires avec couverture

2. **Déploiement**
   - Préproduction automatique sur validation des tests
   - Production avec approbation manuelle
   - Rollback automatique en cas d'échec

3. **Documentation**
   - Génération automatique de la documentation API
   - Mise à jour du changelog
   - Publication des versions de documentation

## 📝 Bonnes Pratiques

### Développement
- Commits atomiques avec [Conventional Commits](https://www.conventionalcommits.org/)
- Branches nommées : `feature/`, `fix/`, `docs/`, `refactor/`, `chore/`
- Revues de code obligatoires avant merge

### Documentation
- Anglais technique pour le code et la documentation
- Commentaires expliquant le "pourquoi" plus que le "comment"
- Mise à jour synchrone avec le code

## 🔒 Sécurité

- Vérification des dépendances (npm audit, Dependabot)
- Analyse de code statique (SAST)
- Tests de pénétration réguliers
- Politique de divulgation responsable

## 🤖 Automatisation

### Scripts Utiles

```bash
# Lancer les tests
npm test

# Générer la documentation
docs:generate

# Vérifier la sécurité
security:scan

# Formater le code
format
```

## 🆘 Support

Pour les questions ou problèmes :
1. Vérifier la documentation existante
2. Chercher dans les issues existantes
3. Ouvrir une nouvelle issue avec le template approprié

---

*Dernière mise à jour : 2025-07-30*
