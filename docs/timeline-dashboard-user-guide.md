# Timeline Dashboard - Guide Utilisateur

## 🎯 Vue d'ensemble

Le Timeline Dashboard est un outil d'analyse chronologique des événements de votre flotte OneLog Africa. Il permet aux superviseurs de visualiser, analyser et investiguer l'historique des trajets, livraisons et incidents.

---

## 🚀 Accès au Timeline Dashboard

### Navigation
1. Connectez-vous à votre tableau de bord OneLog Africa
2. Cliquez sur **"Timeline"** dans le menu principal
3. Ou utilisez l'URL directe : `/timeline`

### Permissions requises
- **Superviseur** : Accès complet (lecture, filtrage, export)
- **Gestionnaire** : Accès complet + modification des événements
- **Administrateur** : Accès complet + gestion des paramètres

---

## 📊 Interface Utilisateur

### Layout Principal
```
┌─────────────────────────────────────────────────────────────┐
│                    Filtres Timeline                         │
├─────────────────────────────────────────────────────────────┤
│  [Jour 1 - 15 Mars 2024]  📍 3 événements                 │
│    🚛 10:30 - Départ Véhicule TRK-001                     │
│    📦 14:15 - Livraison Client ABC                         │
│    ⚠️  16:45 - Incident Route N1                           │
│                                                             │
│  [Jour 2 - 14 Mars 2024]  📍 2 événements                 │
│    🔧 09:00 - Maintenance Préventive                       │
│    🚛 11:30 - Départ Véhicule TRK-002                     │
└─────────────────────────────────────────────────────────────┘
```

### Composants Principaux

#### 1. **Panneau de Filtres** (Haut de page)
- **Période** : Sélection de dates (du/au)
- **Types d'événements** : Départ, Arrivée, Incident, Maintenance, Retard
- **Véhicules** : Filtrage par véhicule spécifique
- **Statut** : Complété, En cours, Annulé, Retardé
- **Gravité** : Faible, Moyenne, Élevée, Critique

#### 2. **Timeline Principale** (Centre)
- **Séparateurs de jour** : Dates avec compteurs d'événements
- **Événements** : Cards individuelles avec détails
- **Ligne temporelle** : Indicateur visuel vertical

#### 3. **Modal de Détails** (Popup)
- **Informations complètes** : Tous les détails de l'événement
- **Actions** : Modifier, Exporter, Marquer comme résolu

---

## 🔍 Utilisation des Filtres

### Filtrage par Période
```
📅 Du : [15/03/2024] Au : [22/03/2024]
```
- Cliquez sur les champs de date pour ouvrir le calendrier
- Sélectionnez la période souhaitée
- Les événements se mettent à jour automatiquement

### Filtrage par Type d'Événement
```
☑️ Départ        ☑️ Arrivée       ☐ Incident
☑️ Maintenance   ☐ Retard
```
- Cochez/décochez les types souhaités
- Filtrage en temps réel
- Badge avec nombre de filtres actifs

### Filtrage par Véhicule
```
🚛 Véhicule : [Tous] ▼
              ├─ TRK-001 (Camion Dakar)
              ├─ TRK-002 (Camion Thiès)
              └─ VAN-003 (Fourgon Rufisque)
```

### Filtrage par Statut
```
🔄 Statut : [Tous] ▼
            ├─ ✅ Complété
            ├─ 🔄 En cours
            ├─ ❌ Annulé
            └─ ⏰ Retardé
```

---

## 📋 Types d'Événements

### 🚛 Départ
- **Couleur** : Bleu (#1A3C40)
- **Informations** : Heure, véhicule, destination, chauffeur
- **Actions** : Voir détails, modifier itinéraire

### 📦 Arrivée/Livraison
- **Couleur** : Vert (#009688)
- **Informations** : Heure, client, produits, statut livraison
- **Actions** : Confirmer livraison, générer bon

### ⚠️ Incident
- **Couleur** : Orange (#E65100)
- **Informations** : Type, gravité, localisation, description
- **Actions** : Marquer résolu, assigner technicien

### 🔧 Maintenance
- **Couleur** : Violet (#7B1FA2)
- **Informations** : Type maintenance, durée, coût, pièces
- **Actions** : Programmer prochaine, voir historique

### ⏰ Retard
- **Couleur** : Rouge (#D32F2F)
- **Informations** : Durée retard, cause, impact client
- **Actions** : Notifier client, ajuster planning

---

## 🔍 Consultation des Événements

### Visualisation Rapide
Chaque événement affiche :
- **Icône** : Type d'événement
- **Heure** : Timestamp précis
- **Titre** : Description courte
- **Statut** : Badge coloré
- **Véhicule** : Identifiant du véhicule

### Détails Complets
Cliquez sur un événement pour voir :
- **Informations détaillées** : Tous les champs
- **Localisation** : Coordonnées GPS si disponibles
- **Historique** : Modifications précédentes
- **Documents** : Photos, bons, rapports
- **Actions** : Modifier, exporter, résoudre

---

## 📊 Fonctionnalités Avancées

### Export de Données
```
📥 Exporter : [PDF] [Excel] [CSV]
```
- **PDF** : Rapport formaté avec graphiques
- **Excel** : Données structurées pour analyse
- **CSV** : Format compatible avec autres outils

### Recherche Textuelle
```
🔍 Rechercher : [Incident Route N1...]
```
- Recherche dans tous les champs texte
- Résultats en temps réel
- Surlignage des termes trouvés

### Statistiques Rapides
```
📊 Cette période :
    • 45 événements total
    • 12 départs, 11 arrivées
    • 3 incidents, 2 maintenances
    • 92% taux de réussite
```

---

## 🎨 Personnalisation

### Préférences d'Affichage
- **Hauteur timeline** : Ajustable selon l'écran
- **Nombre d'événements** : Pagination automatique
- **Format dates** : Français par défaut
- **Thème** : Couleurs OneLog Africa

### Raccourcis Clavier
- **Ctrl + F** : Recherche rapide
- **Ctrl + E** : Export PDF
- **Échap** : Fermer modal
- **↑/↓** : Navigation événements

---

## 📱 Version Mobile

### Adaptations Mobiles
- **Navigation tactile** : Swipe pour défiler
- **Filtres compacts** : Menu déroulant
- **Événements empilés** : Layout vertical optimisé
- **Modal plein écran** : Détails sur toute la hauteur

### Gestes Tactiles
- **Tap** : Ouvrir détails événement
- **Long press** : Menu contextuel
- **Swipe gauche** : Actions rapides
- **Pinch** : Zoom sur timeline

---

## 🔧 Dépannage

### Problèmes Courants

#### Timeline ne se charge pas
1. Vérifiez votre connexion internet
2. Actualisez la page (F5)
3. Videz le cache navigateur
4. Contactez le support si persistant

#### Filtres ne fonctionnent pas
1. Vérifiez les permissions utilisateur
2. Réinitialisez les filtres (bouton "Effacer")
3. Vérifiez la période sélectionnée

#### Export échoue
1. Vérifiez l'espace disque disponible
2. Désactivez les bloqueurs de popup
3. Essayez un autre format (CSV au lieu de PDF)

### Performances
- **Chargement lent** : Réduisez la période de filtrage
- **Scroll saccadé** : Fermez autres onglets navigateur
- **Mémoire élevée** : Actualisez la page régulièrement

---

## 📞 Support

### Contacts
- **Support technique** : support@onelog-africa.com
- **Formation** : formation@onelog-africa.com
- **Urgences** : +221 XX XXX XXXX

### Ressources
- **Documentation complète** : `/docs/timeline-dashboard-specs.md`
- **Vidéos tutoriels** : Portal OneLog Africa
- **FAQ** : Base de connaissances interne

---

## 🔄 Mises à Jour

### Version Actuelle : Phase 3 MVP
- **Date** : Mars 2024
- **Fonctionnalités** : Timeline complète, filtres avancés, export
- **Prochaines versions** : Graphiques avancés, notifications temps réel

### Historique des Versions
- **v3.0** : Timeline Dashboard MVP
- **v2.0** : Cards Dashboard
- **v1.0** : Supervision MVP

---

*Guide mis à jour le : 17 Juillet 2025*  
*Version : Phase 3 MVP*  
*Équipe OneLog Africa*
