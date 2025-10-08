#!/usr/bin/env pwsh
# setup-runner.ps1 – OneLogAfrica
# Usage : powershell -ExecutionPolicy Bypass -File setup-runner.ps1 -Token <REGISTRATION_TOKEN>

param(
  [Parameter(Mandatory = $true)]
  [string]$Token
)

$RepoUrl    = 'https://github.com/sergeahiwa/OneLogAfrica'
$RunnerRoot = 'C:\actions-runner'
$ZipName    = 'actions-runner-win-x64-2.325.0.zip'
$ZipPath    = Join-Path $RunnerRoot $ZipName

# 1. Dossier runner
if (-not (Test-Path $RunnerRoot)) {
  New-Item -ItemType Directory -Path $RunnerRoot -Force | Out-Null
}

# 2. Extraction si nécessaire
if (-not (Test-Path (Join-Path $RunnerRoot 'config.cmd'))) {
  if (-not (Test-Path $ZipPath)) {
    Write-Host "Archive $ZipName manquante dans $RunnerRoot. Téléchargez-là depuis GitHub !" -ForegroundColor Red
    exit 1
  }
  Write-Host "[+] Extraction de $ZipName…" -ForegroundColor Cyan
  Expand-Archive $ZipPath -DestinationPath $RunnerRoot -Force
}

Push-Location $RunnerRoot

# 3. Configuration
if (-not (Test-Path '.runner')) {
  Write-Host "[+] Configuration du runner…" -ForegroundColor Cyan
  .\config.cmd --url $RepoUrl --token $Token --unattended
} else {
  Write-Host "[i] Runner déjà configuré." -ForegroundColor Yellow
}

# 4. Démarrage
Write-Host "[+] Démarrage du runner…" -ForegroundColor Cyan
Start-Process -FilePath "$RunnerRoot\run.cmd"

Write-Host "✅ Runner auto-hébergé prêt et à l’écoute" -ForegroundColor Green
Pop-Location