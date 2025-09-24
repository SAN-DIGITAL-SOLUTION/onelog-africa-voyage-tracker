# Script PowerShell pour diagnostiquer et corriger le problème DNS Supabase
# OneLog Africa - Résolution ERR_NAME_NOT_RESOLVED

Write-Host "=== Diagnostic DNS Supabase OneLog Africa ===" -ForegroundColor Cyan

# 1. Vérifier la connectivité réseau
Write-Host "`n1. Test de connectivité réseau..." -ForegroundColor Yellow
Test-NetConnection -ComputerName "8.8.8.8" -Port 53 -InformationLevel Quiet

# 2. Tester la résolution DNS
Write-Host "`n2. Test de résolution DNS..." -ForegroundColor Yellow
try {
    $dnsResult = Resolve-DnsName "fhiegxnqgjlgpbywujzo.supabase.co" -ErrorAction Stop
    Write-Host "✅ DNS résolu avec succès:" -ForegroundColor Green
    $dnsResult | Format-Table Name, IPAddress
} catch {
    Write-Host "❌ Erreur DNS: $($_.Exception.Message)" -ForegroundColor Red
    
    # Essayer avec des serveurs DNS alternatifs
    Write-Host "`n3. Test avec serveurs DNS alternatifs..." -ForegroundColor Yellow
    
    # Google DNS
    try {
        $googleDns = Resolve-DnsName "fhiegxnqgjlgpbywujzo.supabase.co" -Server "8.8.8.8" -ErrorAction Stop
        Write-Host "✅ Résolution réussie avec Google DNS (8.8.8.8)" -ForegroundColor Green
        $googleDns | Format-Table Name, IPAddress
    } catch {
        Write-Host "❌ Échec avec Google DNS" -ForegroundColor Red
    }
    
    # Cloudflare DNS
    try {
        $cloudflareDns = Resolve-DnsName "fhiegxnqgjlgpbywujzo.supabase.co" -Server "1.1.1.1" -ErrorAction Stop
        Write-Host "✅ Résolution réussie avec Cloudflare DNS (1.1.1.1)" -ForegroundColor Green
        $cloudflareDns | Format-Table Name, IPAddress
    } catch {
        Write-Host "❌ Échec avec Cloudflare DNS" -ForegroundColor Red
    }
}

# 4. Vider le cache DNS
Write-Host "`n4. Vidage du cache DNS..." -ForegroundColor Yellow
ipconfig /flushdns
Write-Host "✅ Cache DNS vidé" -ForegroundColor Green

# 5. Vérifier les paramètres DNS actuels
Write-Host "`n5. Configuration DNS actuelle..." -ForegroundColor Yellow
Get-DnsClientServerAddress | Where-Object {$_.AddressFamily -eq 2} | Format-Table InterfaceAlias, ServerAddresses

# 6. Suggestions de correction
Write-Host "`n=== SOLUTIONS RECOMMANDÉES ===" -ForegroundColor Cyan
Write-Host "1. Changer les serveurs DNS:" -ForegroundColor White
Write-Host "   - DNS primaire: 8.8.8.8 (Google)" -ForegroundColor Gray
Write-Host "   - DNS secondaire: 1.1.1.1 (Cloudflare)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Redémarrer l'adaptateur réseau:" -ForegroundColor White
Write-Host "   - Panneau de configuration > Réseau > Désactiver/Réactiver" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Vérifier le pare-feu/antivirus:" -ForegroundColor White
Write-Host "   - Autoriser les connexions vers *.supabase.co" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Utiliser un VPN si problème de géolocalisation" -ForegroundColor White

# 7. Test de connectivité HTTPS
Write-Host "`n6. Test de connectivité HTTPS..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://fhiegxnqgjlgpbywujzo.supabase.co" -Method Head -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ Connexion HTTPS réussie - Code: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur HTTPS: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Diagnostic terminé ===" -ForegroundColor Cyan
