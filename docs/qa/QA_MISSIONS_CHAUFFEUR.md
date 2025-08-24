# Fiche Test QA – Module Missions Chauffeur

## Objectif
Valider le flux complet des missions du point de vue du chauffeur, de la réception à la finalisation.

## Scénarios de test

### 1. Réception d'une nouvelle mission
- [ ] Notification push/email lors de l'assignation
- [ ] Affichage dans la liste des missions en attente
- [ ] Détails complets de la mission accessibles

### 2. Acceptation/Refus d'une mission
- [ ] Boutons d'action visibles et fonctionnels
- [ ] Confirmation avant refus avec motif obligatoire
- [ ] Mise à jour en temps réel du statut

### 3. Démarrage d'une mission
- [ ] Vérification des prérequis (documents, équipement)
- [ ] Enregistrement de l'heure de départ
- [ ] Activation du suivi GPS

### 4. Gestion des incidents en cours de mission
- [ ] Déclaration d'incident avec photos/commentaires
- [ ] Notification à l'exploitant
- [ ] Mise à jour de l'ETA si nécessaire

### 5. Finalisation de la mission
- [ ] Signature électronique du client
- [ ] Photos de preuve de livraison
- [ ] Rapport de mission automatique généré

## Données de test
- Compte chauffeur actif
- Mission assignée en statut "En attente"
- Données client et destination valides

## Environnement de test
- Appareil mobile Android/iOS
- Connexion 4G/5G active
- GPS activé

## Résultats attendus
- Toutes les actions sont enregistrées en temps réel
- Les notifications sont reçues sans délai
- L'interface reste réactive pendant les opérations
- Les données sont synchronisées avec le backend
