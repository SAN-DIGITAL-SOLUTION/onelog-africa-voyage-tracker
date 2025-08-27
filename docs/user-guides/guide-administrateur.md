# 🛡️ Guide Administrateur - OneLog Africa

## Vue d'Ensemble Administration

Ce guide détaille l'utilisation des fonctionnalités d'administration de OneLog Africa pour la gestion complète de la plateforme.

## 🔐 Accès Administrateur

### Connexion Admin
1. **URL dédiée** : `https://onelog-africa.com/admin`
2. **Identifiants** : Compte avec rôle administrateur
3. **Double authentification** : Obligatoire pour les admins
4. **Session** : Expiration automatique après 2h d'inactivité

### Niveaux d'Administration
- **Super Admin** : Accès complet à toutes les fonctionnalités
- **Admin Technique** : Gestion système et monitoring
- **Admin Métier** : Gestion utilisateurs et missions
- **Admin Support** : Assistance utilisateurs et résolution incidents

## 📊 Dashboard Administrateur

### Vue d'Ensemble
Le dashboard admin affiche :
- **Métriques temps réel** : Utilisateurs actifs, missions en cours
- **Alertes système** : Erreurs, performances, sécurité
- **Statistiques** : KPIs quotidiens, hebdomadaires, mensuels
- **Actions rapides** : Accès aux fonctions critiques

### Widgets Disponibles
- **Trafic** : Connexions et utilisation
- **Performances** : Temps de réponse, erreurs
- **Missions** : Créations, statuts, problèmes
- **Utilisateurs** : Inscriptions, activité, support
- **Finances** : Chiffre d'affaires, facturations
- **Système** : Santé serveurs, base de données

## 👥 Gestion des Utilisateurs

### Liste des Utilisateurs
**Accès** : Menu **"Utilisateurs" > "Liste"**

**Fonctionnalités** :
- **Recherche** : Par nom, email, téléphone, rôle
- **Filtres** : Statut, rôle, date d'inscription, activité
- **Tri** : Par colonnes (nom, date, connexions)
- **Export** : CSV, Excel des données utilisateurs

### Profils Utilisateurs
**Informations disponibles** :
- **Identité** : Nom, email, téléphone, adresse
- **Rôle** : Client, chauffeur, exploitant, admin
- **Statut** : Actif, suspendu, en attente de validation
- **Activité** : Dernière connexion, missions, statistiques
- **Documents** : Pièces d'identité, permis, assurances

### Actions sur Utilisateurs
- **Créer** : Nouveau compte utilisateur
- **Modifier** : Informations et paramètres
- **Suspendre/Réactiver** : Gestion des accès
- **Supprimer** : Suppression définitive (avec confirmation)
- **Réinitialiser mot de passe** : Envoi lien de réinitialisation
- **Changer rôle** : Modification des permissions

### Gestion des Rôles
**Rôles disponibles** :
- **Client** : Création missions, suivi, facturation
- **Chauffeur** : Réception missions, suivi GPS, livraisons
- **Exploitant** : Gestion flotte, assignation missions
- **QA** : Contrôle qualité, validation processus
- **Admin** : Administration système

**Permissions par rôle** :
- **Lecture** : Consultation des données
- **Écriture** : Modification des données
- **Suppression** : Suppression des éléments
- **Administration** : Gestion des utilisateurs et système

## 🚛 Gestion des Missions

### Supervision des Missions
**Accès** : Menu **"Missions" > "Supervision"**

**Vue d'ensemble** :
- **Missions actives** : Transport en cours avec suivi GPS
- **Missions en attente** : En attente d'assignation
- **Missions problématiques** : Retards, incidents, réclamations
- **Statistiques** : Performances, délais, satisfaction

### Intervention sur Missions
**Actions possibles** :
- **Réassigner** : Changer de chauffeur
- **Modifier** : Détails, horaires, itinéraire
- **Annuler** : Annulation avec notification
- **Forcer statut** : Changement manuel de statut
- **Ajouter note** : Commentaire interne
- **Contacter parties** : Client, chauffeur, exploitant

### Gestion des Incidents
**Types d'incidents** :
- **Retard** : Dépassement horaire prévu
- **Panne** : Problème véhicule
- **Accident** : Incident de circulation
- **Réclamation** : Plainte client
- **Perte/Dégât** : Problème marchandise

**Procédure de traitement** :
1. **Réception** : Alerte automatique ou signalement
2. **Évaluation** : Analyse de la situation
3. **Action** : Mesures correctives
4. **Communication** : Information des parties
5. **Suivi** : Vérification résolution
6. **Clôture** : Finalisation du dossier

## 📈 Monitoring et Performances

### Métriques Système
**Surveillance temps réel** :
- **Serveurs** : CPU, RAM, disque, réseau
- **Base de données** : Connexions, requêtes, performances
- **Application** : Temps de réponse, erreurs, utilisateurs
- **APIs** : Disponibilité, latence, taux d'erreur

### Alertes Configurées
**Seuils d'alerte** :
- **Performance** : Temps de réponse > 2s
- **Erreurs** : Taux d'erreur > 5%
- **Système** : CPU > 80%, RAM > 90%
- **Sécurité** : Tentatives de connexion suspectes

**Canaux de notification** :
- **Email** : Alertes importantes
- **SMS** : Alertes critiques
- **Slack** : Notifications équipe technique
- **Dashboard** : Alertes visuelles

### Rapports de Performance
**Rapports disponibles** :
- **Quotidien** : Résumé journalier automatique
- **Hebdomadaire** : Analyse des tendances
- **Mensuel** : Bilan complet avec recommandations
- **Personnalisé** : Rapports sur mesure

## 🔒 Sécurité et Conformité

### Gestion des Accès
**Contrôles de sécurité** :
- **Authentification forte** : 2FA obligatoire pour admins
- **Sessions** : Expiration automatique
- **Permissions** : Contrôle granulaire par rôle
- **Audit** : Traçabilité de toutes les actions

### Logs et Audit
**Types de logs** :
- **Connexions** : Authentifications réussies/échouées
- **Actions** : Modifications, créations, suppressions
- **Erreurs** : Erreurs système et applicatives
- **Sécurité** : Tentatives d'intrusion, anomalies

**Consultation des logs** :
- **Recherche** : Par utilisateur, date, action, IP
- **Filtrage** : Par type, niveau, module
- **Export** : Téléchargement pour analyse externe
- **Rétention** : Conservation 12 mois minimum

### Conformité RGPD
**Fonctionnalités RGPD** :
- **Consentement** : Gestion des consentements utilisateurs
- **Portabilité** : Export des données personnelles
- **Rectification** : Modification des données
- **Suppression** : Droit à l'oubli
- **Traçabilité** : Historique des traitements

## 💰 Gestion Financière

### Facturation
**Supervision facturation** :
- **Factures générées** : Liste et statuts
- **Paiements** : Suivi des règlements
- **Impayés** : Gestion des retards
- **Relances** : Automatisation des rappels

**Actions disponibles** :
- **Générer facture** : Création manuelle
- **Modifier facture** : Correction avant envoi
- **Annuler facture** : Annulation avec avoir
- **Relancer client** : Envoi rappel de paiement

### Tarification
**Gestion des tarifs** :
- **Grilles tarifaires** : Par type de transport
- **Zones géographiques** : Tarifs par région
- **Suppléments** : Heures de nuit, urgence, weekend
- **Remises** : Conditions et calculs

### Reporting Financier
**Rapports disponibles** :
- **Chiffre d'affaires** : Par période, client, service
- **Marges** : Analyse de rentabilité
- **Impayés** : Suivi des créances
- **Prévisionnel** : Projections financières

## 🔧 Configuration Système

### Paramètres Généraux
**Configuration application** :
- **Nom et logo** : Personnalisation interface
- **Coordonnées** : Informations société
- **Langues** : Langues disponibles
- **Devises** : Monnaies acceptées
- **Fuseaux horaires** : Configuration géographique

### Paramètres Métier
**Configuration fonctionnelle** :
- **Types de missions** : Transport, livraison, déménagement
- **Statuts** : Workflow des missions
- **Notifications** : Templates et déclencheurs
- **Intégrations** : APIs externes, webhooks

### Maintenance
**Outils de maintenance** :
- **Sauvegarde** : Planification et restauration
- **Nettoyage** : Purge des données anciennes
- **Optimisation** : Performance base de données
- **Mise à jour** : Déploiement nouvelles versions

## 📞 Support Utilisateurs

### Tickets de Support
**Gestion des demandes** :
- **Réception** : Email, chat, téléphone, formulaire
- **Classification** : Urgence, type, module concerné
- **Assignation** : Attribution à un technicien
- **Suivi** : Statut et historique des échanges
- **Résolution** : Clôture avec satisfaction client

### Base de Connaissances
**Gestion du contenu** :
- **Articles** : Création et mise à jour
- **Catégories** : Organisation thématique
- **Recherche** : Indexation et pertinence
- **Statistiques** : Articles les plus consultés

### Communication
**Canaux de communication** :
- **Annonces** : Messages généraux utilisateurs
- **Notifications** : Alertes ciblées
- **Newsletter** : Communication périodique
- **Maintenance** : Informations techniques

## 📊 Analytics et Reporting

### Tableaux de Bord
**Dashboards disponibles** :
- **Opérationnel** : Missions, utilisateurs, performances
- **Financier** : CA, marges, facturation
- **Technique** : Système, erreurs, performances
- **Marketing** : Acquisition, rétention, satisfaction

### Rapports Personnalisés
**Création de rapports** :
- **Sélection données** : Choix des métriques
- **Filtres** : Critères de sélection
- **Visualisation** : Graphiques, tableaux
- **Planification** : Envoi automatique
- **Export** : PDF, Excel, CSV

### KPIs Métier
**Indicateurs clés** :
- **Taux de satisfaction** : Note moyenne clients
- **Temps de réponse** : Délai traitement demandes
- **Taux de livraison** : Missions réussies/totales
- **Croissance** : Évolution utilisateurs et CA

---

## 🚨 Procédures d'Urgence

### Incident Critique
1. **Évaluation** : Gravité et impact
2. **Escalade** : Notification équipe technique
3. **Communication** : Information utilisateurs si nécessaire
4. **Résolution** : Actions correctives
5. **Post-mortem** : Analyse et amélioration

### Maintenance d'Urgence
1. **Planification** : Fenêtre de maintenance
2. **Communication** : Préavis utilisateurs
3. **Sauvegarde** : Backup avant intervention
4. **Intervention** : Réalisation des modifications
5. **Vérification** : Tests post-maintenance
6. **Communication** : Confirmation retour normal

---

## 📋 Checklist Administrateur

### Contrôles Quotidiens
- [ ] Vérification alertes système
- [ ] Consultation dashboard performances
- [ ] Traitement tickets support urgents
- [ ] Validation nouvelles inscriptions
- [ ] Contrôle missions problématiques

### Contrôles Hebdomadaires
- [ ] Analyse rapports de performance
- [ ] Révision logs de sécurité
- [ ] Mise à jour base de connaissances
- [ ] Vérification sauvegardes
- [ ] Suivi KPIs métier

### Contrôles Mensuels
- [ ] Audit complet sécurité
- [ ] Analyse financière détaillée
- [ ] Révision paramètres système
- [ ] Formation équipe support
- [ ] Planification évolutions

---

*Guide Administrateur OneLog Africa - Version 1.0 - Août 2025*
