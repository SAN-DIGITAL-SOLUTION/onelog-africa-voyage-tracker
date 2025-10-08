# Tests Unitaires - OneLog Africa Voyage Tracker

## 🚀 Comment exécuter les tests

```bash
# Lancer tous les tests
vendor/bin/phpunit --configuration phpunit.xml

# Lancer une suite spécifique (ex: MissionStatusController)
vendor/bin/phpunit --filter MissionStatusControllerTest
```

## 🐛 Problème résolu : Conflit de classe parasite

### Problème
Un conflit d'autoloading a été identifié et résolu dans le fichier `tests/unit/CreateMissionTest.php` :

- Une classe `MissionController` était redéfinie en fin de fichier
- Ce doublon entrait en conflit avec la vraie classe métier lors de l'exécution des tests
- L'erreur se manifestait par : `Cannot declare class MissionController, because the name is already in use`

### Solution
- Suppression de la classe parasite `MissionController` dans `CreateMissionTest.php`
- Mise à jour du fichier `phpunit.xml` pour utiliser le schéma PHPUnit 11+
- Vérification de l'absence d'autres redéfinitions de classes dans les tests

## ⚙️ Configuration PHPUnit

Le fichier `phpunit.xml` a été mis à jour pour utiliser la dernière version du schéma de configuration :

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="./vendor/phpunit/phpunit/phpunit.xsd"
         bootstrap="vendor/autoload.php"
         colors="true">
    <testsuites>
        <testsuite name="Unit">
            <directory suffix="Test.php">./tests/unit</directory>
        </testsuite>
    </testsuites>
    <coverage processUncoveredFiles="true">
        <include>
            <directory suffix=".php">./php</directory>
        </include>
    </coverage>
</phpunit>
```

## ✅ Résultat

- ✅ Tous les tests passent avec succès (100% vert)
- ✅ Aucun warning ou dépréciation détecté
- ✅ Aucun conflit d'autoloading
- ✅ Couverture de code optimisée

## 🔍 Bonnes pratiques

- Ne jamais redéfinir des classes métiers dans les tests
- Utiliser les mocks pour isoler les dépendances
- Suivre les conventions PSR-4 pour l'autoloading
- Maintenir une couverture de code élevée

## 📊 Couverture de code

Pour générer un rapport de couverture :

```bash
vendor/bin/phpunit --coverage-html reports/coverage
```

Le rapport sera disponible dans le dossier `reports/coverage`.
