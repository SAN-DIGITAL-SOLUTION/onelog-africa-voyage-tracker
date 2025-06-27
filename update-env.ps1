# Script pour mettre à jour le fichier .env de manière sécurisée
$envPath = ".\.env"
$envExamplePath = ".\.env.example"

# Vérifier si le fichier .env existe, sinon le créer
if (-not (Test-Path $envPath)) {
    New-Item -ItemType File -Path $envPath -Force | Out-Null
}

# Lire les variables actuelles
$currentVars = @{}
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith('#')) {
            $parts = $line -split '=', 2
            if ($parts.Count -eq 2) {
                $currentVars[$parts[0].Trim()] = $parts[1].Trim()
            }
        }
    }
}

# Ajouter/mettre à jour les variables nécessaires
$requiredVars = @{
    "VITE_SUPABASE_URL" = $currentVars["VITE_SUPABASE_URL"] ?? "https://fhiegxnqgjlgpbywujzo.supabase.co"
    "VITE_SUPABASE_ANON_KEY" = $currentVars["VITE_SUPABASE_ANON_KEY"] ?? ""
    "SUPABASE_URL" = $currentVars["SUPABASE_URL"] ?? $currentVars["VITE_SUPABASE_URL"] ?? "https://fhiegxnqgjlgpbywujzo.supabase.co"
    "SUPABASE_SERVICE_ROLE_KEY" = $currentVars["SUPABASE_SERVICE_ROLE_KEY"] ?? ""
    "TWILIO_ACCOUNT_SID" = $currentVars["TWILIO_ACCOUNT_SID"] ?? $currentVars["TWILIO_TEST_ACCOUNT_SID"] ?? ""
    "TWILIO_AUTH_TOKEN" = $currentVars["TWILIO_AUTH_TOKEN"] ?? $currentVars["TWILIO_TEST_AUTH_TOKEN"] ?? ""
    "TWILIO_WHATSAPP_FROM" = $currentVars["TWILIO_WHATSAPP_FROM"] ?? "whatsapp:+14155238886"
    "VITE_WEBHOOK_URL" = $currentVars["VITE_WEBHOOK_URL"] ?? "http://localhost:54321/functions/v1"
    "TWILIO_WEBHOOK_URL" = $currentVars["TWILIO_WEBHOOK_URL"] ?? ($currentVars["VITE_WEBHOOK_URL"] + "/notifications" ?? "http://localhost:54321/functions/v1/notifications")
    "NODE_ENV" = $currentVars["NODE_ENV"] ?? "development"
    "VITE_PORT" = $currentVars["VITE_PORT"] ?? "5173"
    "VITE_GOOGLE_MAPS_API_KEY" = $currentVars["VITE_GOOGLE_MAPS_API_KEY"] ?? ""
}

# Écrire les variables dans le fichier .env
$newEnvContent = @"
# Configuration pour OneLog Africa (mise à jour automatique)
# Ne pas modifier manuellement - utilisez le script update-env.ps1

# Configuration Supabase
VITE_SUPABASE_URL=$($requiredVars["VITE_SUPABASE_URL"])
VITE_SUPABASE_ANON_KEY=$($requiredVars["VITE_SUPABASE_ANON_KEY"])
SUPABASE_URL=$($requiredVars["SUPABASE_URL"])
SUPABASE_SERVICE_ROLE_KEY=$($requiredVars["SUPABASE_SERVICE_ROLE_KEY"])

# Configuration Twilio
TWILIO_ACCOUNT_SID=$($requiredVars["TWILIO_ACCOUNT_SID"])
TWILIO_AUTH_TOKEN=$($requiredVars["TWILIO_AUTH_TOKEN"])
TWILIO_WHATSAPP_FROM=$($requiredVars["TWILIO_WHATSAPP_FROM"])

# Configuration des webhooks
VITE_WEBHOOK_URL=$($requiredVars["VITE_WEBHOOK_URL"])
TWILIO_WEBHOOK_URL=$($requiredVars["TWILIO_WEBHOOK_URL"])

# Autres configurations
NODE_ENV=$($requiredVars["NODE_ENV"])
VITE_PORT=$($requiredVars["VITE_PORT"])
VITE_GOOGLE_MAPS_API_KEY=$($requiredVars["VITE_GOOGLE_MAPS_API_KEY"])
"@

# Sauvegarder l'ancien fichier .env s'il existe
if (Test-Path $envPath) {
    $backupPath = "${envPath}.bak"
    Copy-Item -Path $envPath -Destination $backupPath -Force
    Write-Host "Ancien fichier .env sauvegardé dans ${backupPath}"
}

# Écrire le nouveau fichier .env
$newEnvContent | Out-File -FilePath $envPath -Encoding utf8 -NoNewline
Write-Host "Fichier .env mis à jour avec succès"
Write-Host "Veuillez vérifier les valeurs et ajouter SUPABASE_SERVICE_ROLE_KEY si nécessaire"
