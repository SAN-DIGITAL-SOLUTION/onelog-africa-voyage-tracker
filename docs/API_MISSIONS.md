# 📚 API de Gestion des Missions - OneLog Africa

## 📌 Aperçu

Cette documentation couvre les endpoints de l'API de gestion des missions pour le module Voyage Tracker de OneLog Africa.

## 🔐 Authentification

Toutes les requêtes doivent inclure un token JWT valide dans l'en-tête `Authorization` :

```
Authorization: Bearer votre_token_jwt
```

## 📋 Endpoints

### 1. Créer une mission

**URL** : `POST /php/create_mission.php`

**En-têtes requis** :
- `Content-Type: application/json`
- `Accept: application/json`

**Corps de la requête** :
```json
{
  "transporteur_id": 123,
  "departure": "Abidjan, Côte d'Ivoire",
  "arrival": "Bouaké, Côte d'Ivoire",
  "expected_start": "2025-08-01 08:00:00",
  "expected_end": "2025-08-01 14:00:00"
}
```

**Paramètres** :
| Champ | Type | Requis | Description |
|-------|------|---------|-------------|
| transporteur_id | integer | Oui | ID du transporteur assigné à la mission |
| departure | string | Oui | Lieu de départ de la mission |
| arrival | string | Oui | Lieu d'arrivée de la mission |
| expected_start | datetime | Oui | Date et heure de début prévue (format: YYYY-MM-DD HH:MM:SS) |
| expected_end | datetime | Oui | Date et heure de fin prévue (format: YYYY-MM-DD HH:MM:SS) |

**Réponse en cas de succès (201 Created)** :
```json
{
  "success": true,
  "message": "Mission créée avec succès",
  "data": {
    "mission_id": 456,
    "reference": "MIS-2025-00456",
    "status": "planifiee",
    "created_at": "2025-08-01 10:30:00"
  }
}
```

**Codes d'erreur possibles** :
- `400 Bad Request` : Données manquantes ou invalides
- `404 Not Found` : Transporteur non trouvé
- `405 Method Not Allowed` : Méthode HTTP non autorisée
- `500 Internal Server Error` : Erreur serveur

**Exemple d'erreur** :
```json
{
  "success": false,
  "error": {
    "code": 400,
    "message": "La date de fin doit être postérieure à la date de début",
    "type": "validation_error"
  }
}
```

**Notes** :
- La date de fin doit être postérieure à la date de début
- Le transporteur doit exister dans la base de données
- Les champs texte sont automatiquement nettoyés (suppression des balises HTML, échappement des caractères spéciaux)

---

### 2. Mettre à jour le statut d'une mission

**URL** : `POST /php/update_mission_status.php`

**Corps de la requête** :
```json
{
  "mission_id": 456,
  "new_status": "en_cours",
  "comment": "Chargement terminé, départ imminent"
}
```

**Réponse en cas de succès** :
```json
{
  "success": true,
  "message": "Statut mis à jour avec succès",
  "mission_id": 456,
  "new_status": "en_cours"
}
```

---

### 3. Enregistrer une position GPS

**URL** : `POST /php/log_position.php`

**Corps de la requête** :
```json
{
  "mission_id": 456,
  "latitude": 5.3599517,
  "longitude": -4.0082563,
  "speed": 65.5,
  "device_id": "device_12345"
}
```

**Réponse en cas de succès** :
```json
{
  "success": true,
  "message": "Position enregistrée avec succès",
  "mission_id": 456,
  "position_id": 789
}
```

---

### 4. Récupérer le résumé des missions

**URL** : `GET /php/mission_summary.php?transporteur_id=123&date_debut=2025-08-01&date_fin=2025-08-31`

**Paramètres de requête** :
- `transporteur_id` (optionnel) : Filtre par transporteur
- `date_debut` (optionnel) : Date de début au format YYYY-MM-DD
- `date_fin` (optionnel) : Date de fin au format YYYY-MM-DD
- `statut` (optionnel) : Filtre par statut

**Réponse en cas de succès** :
```json
{
  "success": true,
  "stats": {
    "total_missions": 15,
    "missions_terminees": 10,
    "missions_en_cours": 3,
    "missions_en_retard": 2,
    "duree_moyenne_min": 342.5
  },
  "recent_positions": [
    {
      "mission_id": 456,
      "reference": "MIS-2025-0456",
      "transporteur": "TRANS-123",
      "last_latitude": 5.3599517,
      "last_longitude": -4.0082563,
      "last_position_update": "2025-08-01 09:23:45",
      "statut": "en_cours"
    }
  ],
  "status_updates": [
    {
      "mission_id": 456,
      "reference": "MIS-2025-0456",
      "old_status": "planifiee",
      "new_status": "en_cours",
      "comment": "Chargement terminé, départ imminent",
      "update_time": "2025-08-01 08:15:22"
    }
  ],
  "timestamp": "2025-08-01T09:25:00+00:00"
}
```

---

### 5. Envoyer une notification

**URL** : `POST /php/notify_transporter.php`

**Corps de la requête** :
```json
{
  "transporteur_id": 123,
  "type": "nouvelle_mission",
  "data": {
    "mission_id": 456,
    "depart": "Abidjan, Côte d'Ivoire",
    "arrivee": "Bouaké, Côte d'Ivoire",
    "date_debut": "2025-08-01 08:00:00"
  }
}
```

**Types de notification supportés** :
- `nouvelle_mission` : Notification de nouvelle mission attribuée
- `mise_a_jour_mission` : Mise à jour du statut d'une mission
- `annulation_mission` : Annulation d'une mission

**Réponse en cas de succès** :
```json
{
  "success": true,
  "message": "Notification envoyée avec succès",
  "results": {
    "sms_sent": true,
    "email_sent": true,
    "notification_logged": true
  }
}
```

## 🔄 Codes d'erreur HTTP

- `200` : Succès
- `400` : Requête invalide (données manquantes ou incorrectes)
- `401` : Non autorisé (token invalide ou expiré)
- `403` : Accès refusé (permissions insuffisantes)
- `404` : Ressource non trouvée
- `405` : Méthode non autorisée
- `500` : Erreur serveur

## 📡 Environnements

- **Développement** : `https://dev-api.onelog-africa.com`
- **Staging** : `https://staging-api.onelog-africa.com`
- **Production** : `https://api.onelog-africa.com`

## 📞 Support

Pour toute question ou assistance, contactez :
- Email : support@onelog-africa.com
- Téléphone : +225 XX XXX XXXX
- Canal Slack : `#support-devs`
