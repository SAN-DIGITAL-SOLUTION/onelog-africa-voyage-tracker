# Configuration TV - Vue de Supervision Transporteurs

## 📺 Guide d'installation pour écran TV

### 1. Prérequis matériels

- **Écran TV** : 32" minimum recommandé (Full HD ou 4K)
- **Mini PC** : Intel NUC ou Raspberry Pi 4 (8GB RAM minimum)
- **Connexion Internet** : Fibre stable (10 Mbps minimum)
- **Navigateur** : Chrome ou Firefox en mode kiosk

### 2. Installation système

#### 2.1 Configuration Raspberry Pi (optionnel)

```bash
# Installation de l'OS Lite
sudo apt update && sudo apt upgrade -y
sudo apt install chromium-browser unclutter -y

# Configuration du mode kiosk
sudo nano /etc/xdg/lxsession/LXDE-pi/autostart
```

Ajouter ces lignes :
```
@xset s off
@xset -dpms
@xset s noblank
@chromium-browser --kiosk http://localhost:5173/supervision --noerrdialogs --disable-infobars --check-for-update-interval=31536000
```

#### 2.2 Configuration Windows Mini PC

1. Installer Chrome
2. Créer un raccourci avec les arguments :
   ```
   chrome.exe --kiosk http://localhost:5173/supervision --fullscreen --disable-extensions
   ```
3. Placer dans le dossier Démarrage

### 3. Configuration de l'application

#### 3.1 Variables d'environnement

Créer `.env.local` :
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

#### 3.2 Lancement automatique

**Sur Linux (systemd)** :
```bash
sudo nano /etc/systemd/system/onelog-supervision.service
```

Contenu :
```ini
[Unit]
Description=OneLog Africa Supervision
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/onelog-africa-voyage-tracker
ExecStart=/usr/bin/npm run dev -- --host 0.0.0.0 --port 5173
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 4. Configuration réseau

#### 4.1 Adresse IP statique (optionnel)

**Raspberry Pi** :
```bash
sudo nano /etc/dhcpcd.conf
```

Ajouter :
```
interface eth0
static ip_address=192.168.1.100/24
static routers=192.168.1.1
static domain_name_servers=192.168.1.1 8.8.8.8
```

### 5. Mode plein écran automatique

#### 5.1 Configuration navigateur

**Chrome Flags** :
- `--kiosk` : Mode kiosk
- `--disable-extensions` : Désactiver extensions
- `--disable-infobars` : Masquer barres info
- `--noerrdialogs` : Pas de dialogues erreur

#### 5.2 Raccourcis clavier

- **F11** : Basculer plein écran
- **Ctrl+Shift+F** : Supervision plein écran
- **Ctrl+R** : Rafraîchir données

### 6. Optimisations performance

#### 6.1 Cache navigateur

```javascript
// Dans src/pages/SupervisionDashboard.tsx
const refreshData = useCallback(() => {
  queryClient.invalidateQueries(['realtime-missions']);
  queryClient.invalidateQueries(['realtime-vehicles']);
}, [queryClient]);
```

#### 6.2 Intervalle de rafraîchissement

```javascript
// Rafraîchissement automatique toutes les 30 secondes
useEffect(() => {
  const interval = setInterval(refreshData, 30000);
  return () => clearInterval(interval);
}, [refreshData]);
```

### 7. Monitoring et alertes

#### 7.1 Vérification de la connexion

```bash
#!/bin/bash
# /home/pi/check-connection.sh

URL="http://localhost:5173/supervision"
if ! curl -f -s "$URL" > /dev/null; then
    echo "$(date): Connexion perdue - redémarrage" >> /var/log/onelog-monitor.log
    sudo systemctl restart onelog-supervision
fi
```

#### 7.2 Cron job pour monitoring

```bash
# Ajouter à crontab
*/5 * * * * /home/pi/check-connection.sh
```

### 8. Dépannage rapide

| Problème | Solution |
|----------|----------|
| Écran noir | Vérifier connexion réseau, redémarrer service |
| Données non à jour | Rafraîchir page (Ctrl+R) |
| Carte non centrée | Cliquer sur "Centrer sur les véhicules" |
| Mode plein écran perdu | Appuyer sur F11 |

### 9. Contacts support

- **Support technique** : support@onelog-africa.com
- **Urgence** : +229 90 00 00 00
- **Documentation** : docs.onelog-africa.com

### 10. Check-list de déploiement

- [ ] TV installée et allumée
- [ ] Mini PC configuré avec OS
- [ ] Connexion réseau testée
- [ ] Application lancée en mode kiosk
- [ ] Variables d'environnement configurées
- [ ] Mode plein écran activé
- [ ] Rafraîchissement automatique testé
- [ ] Monitoring en place
- [ ] Contacts support disponibles
- [ ] Documentation imprimée et affichée
