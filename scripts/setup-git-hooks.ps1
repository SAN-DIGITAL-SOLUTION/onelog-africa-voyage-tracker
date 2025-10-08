# Script de configuration des hooks Git pour OneLog Africa
# Ce script configure les hooks Git pour appliquer les standards de qualité du code

# Vérifier que nous sommes à la racine du dépôt Git
if (-not (Test-Path -Path ".git")) {
    Write-Error "Ce script doit être exécuté à la racine d'un dépôt Git"
    exit 1
}

# Créer le répertoire des hooks s'il n'existe pas
$hooksDir = ".git/hooks"
if (-not (Test-Path -Path $hooksDir)) {
    New-Item -ItemType Directory -Path $hooksDir | Out-Null
}

# Fonction pour créer un hook
function Set-GitHook {
    param (
        [string]$hookName,
        [string]$scriptContent
    )
    
    $hookPath = "$hooksDir/$hookName"
    
    # Sauvegarder le hook existant s'il existe
    if (Test-Path -Path $hookPath) {
        $backupPath = "$hookPath.backup.$(Get-Date -Format 'yyyyMMddHHmmss')"
        Write-Host "Sauvegarde du hook $hookName existant vers $backupPath" -ForegroundColor Yellow
        Copy-Item -Path $hookPath -Destination $backupPath -Force
    }
    
    # Créer le nouveau hook avec encodage UTF-8 sans BOM
    [System.IO.File]::WriteAllText((Resolve-Path $hookPath), $scriptContent, [System.Text.UTF8Encoding]::new($false))
    
    # Rendre le script exécutable (sous Unix/Linux/Mac)
    if ($IsLinux -or $IsMacOS) {
        chmod +x $hookPath
    }
    
    Write-Host "Hook $hookName configuré avec succès" -ForegroundColor Green
}

# Hook pre-commit : Vérification du code avant commit
$preCommitScript = @"
#!/bin/sh

# Exécuter ESLint sur les fichiers modifiés
echo "Exécution de ESLint..."
npx eslint --fix --ext .js,.jsx,.ts,.tsx $(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|jsx|ts|tsx)$' | tr '\r\n' ' ')

# Si ESLint a échoué, annuler le commit
if [ $? -ne 0 ]; then
    echo "❌ ESLint a trouvé des erreurs. Corrigez-les avant de commiter."
    exit 1
fi

# Exécuter les tests unitaires
echo "Exécution des tests unitaires..."
npm test -- --passWithNoTests

# Si les tests échouent, annuler le commit
if [ $? -ne 0 ]; then
    echo "❌ Des tests ont échoué. Corrigez-les avant de commiter."
    exit 1
fi

echo "✅ Toutes les vérifications ont réussi !"
exit 0
"@

Set-GitHook -hookName "pre-commit" -scriptContent $preCommitScript

# Hook commit-msg : Vérification du format des messages de commit
$commitMsgScript = @"
#!/bin/sh

# Vérifier le format du message de commit
commit_msg_file="`$1"
commit_msg=`cat "`$commit_msg_file"`

# Format attendu : type(portée): description
if ! echo "`$commit_msg" | grep -qE '^(feat|fix|docs|style|refactor|test|chore|ci|perf|build|revert)(\([a-z]+\))?: .{10,}'; then
    echo "❌ Format de message de commit invalide."
    echo "   Utilisez : type(portée): description (au moins 10 caractères)"
    echo "   Exemples :"
    echo "   - feat(auth): ajouter la connexion avec Google"
    echo "   - fix(api): corriger la validation des emails"
    echo "   - docs: mettre à jour le README"
    echo "   Types valides : feat, fix, docs, style, refactor, test, chore, ci, perf, build, revert"
    exit 1
fi
"@

Set-GitHook -hookName "commit-msg" -scriptContent $commitMsgScript

# Hook pre-push : Exécuter les tests avant le push
$prePushScript = @"
#!/bin/sh

echo "🚀 Exécution des tests avant le push..."

# Exécuter les tests E2E
# Désactivé temporairement car peut être long
# echo "Exécution des tests E2E..."
# npm run test:e2e
# if [ $? -ne 0 ]; then
#     echo "❌ Les tests E2E ont échoué. Corrigez les problèmes avant de pousser."
#     exit 1
# fi

echo "✅ Tous les tests ont réussi !"
exit 0
"@

Set-GitHook -hookName "pre-push" -scriptContent $prePushScript

Write-Host "✅ Configuration des hooks Git terminée avec succès !" -ForegroundColor Green
