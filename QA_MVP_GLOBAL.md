# Fiche Test QA – MVP Global OneLog Africa

## Objectif
Valider tous les scénarios de bout en bout du MVP, du point de vue Admin, Client, Exploitant, Chauffeur.

---

### 1. Connexion Admin → Création Demande Client → Validation Exploitant → Affectation Chauffeur → Exécution Mission → Facturation

#### Étapes
- Connexion en tant qu’admin
- Créer un utilisateur client, exploitant, chauffeur
- Se connecter en tant que client, créer une demande
- Se connecter en tant qu’exploitant, valider la demande
- Affecter un chauffeur à la demande validée
- Se connecter en tant que chauffeur, accepter/démarrer/terminer la mission (incident/signature)
- Se connecter en tant qu’admin/exploitant, générer une facture

#### Données d’entrée
- Utilisateurs de chaque rôle, demande test, mission test

#### Résultats attendus
- Chaque étape aboutit sans erreur
- Statuts et transitions corrects en base (demandes, missions, factures)
- Notifications reçues
- RLS respectée à chaque étape

#### Points de vérification RLS
- Un utilisateur ne peut accéder/modifier que ses propres données
- Les statuts ne peuvent être changés que par le rôle autorisé

---

### 2. Connexion Client → Création demande → Suivi tracking → Réception notification/facture

#### Étapes
- Connexion client
- Création demande
- Suivi de la demande (tracking, notifications)
- Réception notification de mission terminée et facture

#### Données d’entrée
- Compte client, demande test

#### Résultats attendus
- Statuts corrects, tracking visible, notification reçue, facture générée
- RLS respectée

---

### 3. Connexion Exploitant → Validation → Affectation → Monitoring

#### Étapes
- Connexion exploitant
- Validation demande
- Affectation chauffeur
- Suivi des missions en cours

#### Données d’entrée
- Compte exploitant, demande test

#### Résultats attendus
- Statuts corrects, affectation possible, monitoring en temps réel
- RLS respectée

---

### 4. Cas de sécurité et erreurs
- Tentative d’accès non autorisé (autre rôle, utilisateur non authentifié)
- Tentative de modification par un utilisateur non autorisé
- Vérification des logs d’audit

---
