# Documentation des API - OneLog Africa

## Table des matières
- [Introduction](#introduction)
- [Endpoints d'API](#endpoints)
  - [Santé de l'API](#santé-de-lapi)
  - [Vérification des rôles](#vérification-des-rôles)
- [Webhooks](#webhooks)
  - [Webhook Twilio](#webhook-twilio)
- [Authentification et autorisation](#authentification-et-autorisation)
- [Gestion des erreurs](#gestion-des-erreurs)
- [Bonnes pratiques](#bonnes-pratiques)
- [Exemples de requêtes](#exemples-de-requêtes)

## Introduction
Ce document fournit une documentation complète des API REST et des webhooks disponibles dans l'application OneLog Africa. Toutes les réponses sont au format JSON.

## Endpoints

### Santé de l'API
Vérifie que l'API est opérationnelle.

```http
GET /api/health
```

**Réponse**
```json
{
  "status": "ok",
  "timestamp": "2025-07-30T13:30:00.000Z"
}
```

### Vérification des rôles
Vérifie le rôle d'un utilisateur spécifique.

```http
GET /api/user/check-role?userId=user_123
```

**Paramètres de requête**
- `userId` (requis) - L'identifiant unique de l'utilisateur

**Réponse**
```json
{
  "data": {
    "role": "driver",
    "approved": true
  }
}
```

## Webhooks

### Webhook Twilio
Endpoint pour recevoir les notifications de statut des messages Twilio.

```http
POST /api/webhooks/twilio
```

**En-têtes requis**
- `x-twilio-signature`: Signature de sécurité générée par Twilio
- `Content-Type`: `application/x-www-form-urlencoded`

**Corps de la requête**
Les paramètres de la requête sont encodés en `x-www-form-urlencoded` et contiennent les informations du statut du message.

**Réponse**
```json
{
  "status": "received"
}
```

**Sécurité**
- Validation de la signature Twilio
- Limitation de débit appliquée

## Authentification et autorisation
Toutes les requêtes (sauf `/api/health`) nécessitent un jeton JWT valide dans l'en-tête `Authorization`.

```
Authorization: Bearer <votre_jwt_ici>
```

## Gestion des erreurs
Les erreurs suivent le format standard :

```json
{
  "error": {
    "code": "code_erreur",
    "message": "Description détaillée de l'erreur"
  }
}
```

## Bonnes pratiques
1. **Validation des entrées** : Toutes les entrées doivent être validées côté serveur
2. **Gestion des erreurs** : Toujours gérer les réponses d'erreur
3. **Sécurité** : Ne jamais exposer de données sensibles dans les réponses
4. **Performance** : Utiliser la pagination pour les listes volumineuses

## Exemples de requêtes

### Vérification de l'état de l'API
```bash
curl -X GET "https://api.onelog-africa.com/api/health"
```

### Vérification du rôle utilisateur
```bash
curl -X GET \
  "https://api.onelog-africa.com/api/user/check-role?userId=user_123" \
  -H "Authorization: Bearer votre_jwt_ici"
```

### Configuration du webhook Twilio
```bash
curl -X POST \
  "https://api.onelog-africa.com/api/webhooks/twilio" \
  -H "x-twilio-signature: signature_valide" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "MessageSid=SM1234567890abcdef&MessageStatus=delivered"
```
