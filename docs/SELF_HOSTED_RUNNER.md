# 🖥️ Self-Hosted GitHub Actions Runner (Windows)

Ce guide explique comment installer et exécuter un runner GitHub Actions auto-hébergé sur Windows pour le dépôt **OneLogAfrica**. Il couvre :

1. Téléchargement du binaire runner.
2. Vérification de l’intégrité (SHA-256).
3. Extraction et configuration du runner.
4. Démarrage interactif ou en tant que service.
5. Exemple minimal de workflow utilisant `runs-on: self-hosted`.

---
## 1. Pré-requis

* Windows 10/11 ou Windows Server 2019+
* PowerShell 5.1+ (intégré) ou PowerShell Core (pwsh)
* Accès administrateur pour enregistrer un service (⚙️ facultatif)
* Port 443 sortant vers `github.com` / `api.github.com`

---
## 2. Téléchargement et validation de l’archive

```powershell
# Crée le dossier d’installation
New-Item -ItemType Directory -Path C:\actions-runner -Force

# Télécharge l’archive ZIP du runner (v2.325.0)
Invoke-WebRequest -Uri https://github.com/actions/runner/releases/download/v2.325.0/actions-runner-win-x64-2.325.0.zip -OutFile C:\actions-runner\actions-runner.zip

# Vérifie la somme SHA-256
$expected = '8601AA56828C084B29BDFDA574AF1FCDE0943CE275FDBAFB3E6D4A8611245B1B'
$actual   = (Get-FileHash C:\actions-runner\actions-runner.zip -Algorithm SHA256).Hash
if ($actual -ne $expected) { throw "Checksum mismatch: $actual" }
```

---
## 3. Extraction et configuration

```powershell
# Décompresse l’archive
Expand-Archive C:\actions-runner\actions-runner.zip -DestinationPath C:\actions-runner -Force

# Passe dans le dossier
cd C:\actions-runner

# Configure le runner (remplacez le token par celui généré dans Settings > Actions > Runners > Add runner)
./config.cmd --url https://github.com/sergeahiwa/OneLogAfrica --token <TOKEN_Ici>
```

> 🔐 Le token d’inscription expire après 60 minutes. Générez-en un nouveau si nécessaire.

---
## 4. Démarrage du runner

### 4.1 Mode interactif (recommandé pour debug)

```powershell
cd C:\actions-runner
./run.cmd
```

La console doit afficher _"Listening for Jobs"_.

### 4.2 Installation en service Windows (production)

```powershell
cd C:\actions-runner
./svc install
./svc start
```

Le service démarre automatiquement au boot.

---
## 5. Workflow YAML minimal

```yaml
ame: E2E Tests (Self-Hosted)

on: [push, pull_request]

jobs:
  tests:
    runs-on: self-hosted
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run test:e2e:ci
```

> ✔️ Le tag `self-hosted` suffit ; ajoutez d’autres tags si vous en définissez lors de la configuration (`--labels`).

---
## 6. Script d’automatisation

Le script **`setup-runner.ps1`** à la racine du projet exécute automatiquement toutes les étapes ci-dessus ; lancez-le avec :

```powershell
pwsh ./setup-runner.ps1
```

Il créera le dossier, téléchargera le runner, vérifiera la checksum, l’extraira puis lancera la configuration et démarrera le runner.
