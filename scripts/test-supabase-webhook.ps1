# PowerShell script to test Supabase notifications webhook and check DB log
# Usage: Run from project root. Requires Invoke-RestMethod and curl (for jq if needed)

# Config
$webhookUrl = "https://fhiegxnqgjlgpbywujzo.supabase.co/functions/v1/notifications"
$from = "whatsapp:+14155238886"
$to = "whatsapp:+14155238886"
$body = "Test Automatique Cascade $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

# 1. Envoi du message simulé (POST)
$response = Invoke-WebRequest -Uri $webhookUrl -Method POST -Body "From=$from&To=$to&Body=$body" -ContentType "application/x-www-form-urlencoded"
Write-Host "Réponse HTTP : $($response.StatusCode)"

# 2. Vérification dans la table notification_logs via Supabase REST API
# Nécessite la clé service_role !
$SUPABASE_URL = "https://fhiegxnqgjlgpbywujzo.supabase.co"
$SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoaWVneG5xZ2psZ3BieXd1anpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTg5Mzg5OCwiZXhwIjoyMDY1NDY5ODk4fQ.KbSVKMwwL6hmqfhrgBh9f_t61r_-zvscOva1FGr_-Hg"

# On cherche le dernier log avec ce contenu
$headers = @{ "apikey" = $SUPABASE_SERVICE_ROLE_KEY; "Authorization" = "Bearer $SUPABASE_SERVICE_ROLE_KEY" }
$filter = [System.Web.HttpUtility]::UrlEncode("content=eq.$body")
$logUrl = "$SUPABASE_URL/rest/v1/notification_logs?content=eq.$([uri]::EscapeDataString($body))&select=*&order=created_at.desc&limit=1"

try {
    $logResponse = Invoke-RestMethod -Uri $logUrl -Headers $headers -Method GET
    if ($logResponse) {
        Write-Host "✅ Log trouvé dans notification_logs : "
        $logResponse | ConvertTo-Json -Depth 5
    } else {
        Write-Host "❌ Aucun log trouvé pour ce message."
    }
} catch {
    Write-Host "Erreur lors de la requête REST Supabase : $_"
}
