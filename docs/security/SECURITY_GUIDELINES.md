# Lignes Directrices de Sécurité - OneLog Africa

## Principes de Base
- **Moins de privilèges** : Chaque utilisateur n'a accès qu'aux ressources nécessaires
- **Défense en profondeur** : Plusieurs couches de sécurité à chaque niveau
- **Audit continu** : Surveillance et logs de toutes les actions critiques

## Contrôles d'Accès

### RLS (Row Level Security)
- **Table `missions`** :
  - Chauffeur assigné : lecture/écriture sur sa mission
  - Exploitant : lecture/écriture sur toutes les missions de son entreprise
  - Admin : accès complet

- **Table `demandes`** :
  - Client créateur : lecture/écriture sur ses demandes
  - Exploitant : lecture/écriture sur les demandes de son entreprise
  - Admin : accès complet

- **Table `tracking`** :
  - Chauffeur concerné : lecture seule
  - Exploitant : lecture sur ses chauffeurs
  - Admin : accès complet

## Protection des Données

### Chiffrement
- Données en transit : TLS 1.3 obligatoire
- Données au repos : Chiffrement AES-256
- Mots de passe : Hachage bcrypt avec sel

### Gestion des Sessions
- JWT avec expiration courte (15 min)
- Renouvellement silencieux du token
- Invalidation côté serveur lors de la déconnexion

## Bonnes Pratiques de Développement

### Backend
- Validation stricte des entrées
- Protection contre les injections SQL
- Rate limiting sur les API critiques
- Headers de sécurité HTTP (CSP, HSTS, etc.)

### Frontend
- Échappement du contenu dynamique
- Protection XSS/CSRF
- Validation côté client ET serveur

## Surveillance et Réponse aux Incidents

### Journalisation
- Toutes les actions critiques
- Échecs d'authentification
- Modifications des permissions

### Réponse aux Incidents
1. Identification de la faille
2. Contenir l'impact
3. Éradiquer la menace
4. Rétablir les services
5. Post-mortem et prévention

## Tests de Sécurité
- Scans automatiques hebdomadaires
- Tests de pénétration trimestriels
- Revues de code avec focus sécurité

## Formation et Sensibilisation
- Formation sécurité pour les développeurs
- Conscience des menaces pour tous les employés
- Exercices de phishing réguliers
