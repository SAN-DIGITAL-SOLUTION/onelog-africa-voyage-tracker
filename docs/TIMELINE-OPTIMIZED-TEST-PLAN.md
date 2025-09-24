# Plan de test - Timeline Optimisée

## 1. Objectif
Valider le bon fonctionnement et les performances de la page Timeline Optimisée (`/timeline-optimized`) avant son déploiement en production.

## 2. Environnements de test
- **Local** : http://localhost:5173/timeline-optimized
- **Staging** : [URL_STAGING]/timeline-optimized
- **Production** : [URL_PRODUCTION]/timeline-optimized

## 3. Matériel de test
- Ordinateur avec navigateur moderne (Chrome, Firefox, Edge)
- Outils de développement navigateur (F12)
- Extension Lighthouse pour les tests de performance
- Connexion réseau variable (4G, 3G, lent)
- Appareils mobiles (optionnel pour les tests de réactivité)

## 4. Checklist de tests manuels

### 4.1 Chargement initial
- [ ] La page se charge sans erreur dans la console
- [ ] L'écran de chargement s'affiche immédiatement
- [ ] Les événements s'affichent dans un délai raisonnable (<2s)
- [ ] Le compteur d'événements affiche le bon nombre
- [ ] Les séparateurs de date s'affichent correctement

### 4.2 Fonctionnement des filtres
#### Barre de recherche
- [ ] La recherche par texte filtre correctement les événements
- [ ] La recherche est insensible à la casse
- [ ] La recherche fonctionne avec des termes partiels
- [ ] L'icône de réinitialisation efface la recherche

#### Filtre par type d'événement
- [ ] La sélection d'un type filtre correctement les événements
- [ ] La désélection d'un type réinitialise le filtre
- [ ] Plusieurs types peuvent être sélectionnés

#### Filtre par statut
- [ ] La sélection d'un statut filtre correctement
- [ ] La désélection réinitialise le filtre
- [ ] Plusieurs statuts peuvent être sélectionnés

#### Filtre par dates
- [ ] La sélection d'une plage filtre correctement
- [ ] La sélection d'un jour unique fonctionne
- [ ] Le sélecteur de dates est intuitif
- [ ] Le format des dates est cohérent

#### Réinitialisation
- [ ] Le bouton de réinitialisation efface tous les filtres
- [ ] L'URL est mise à jour en conséquence
- [ ] Tous les événements sont à nouveau visibles

### 4.3 Défilement et chargement infini
- [ ] Le défilement est fluide (60 FPS)
- [ ] Le chargement des événements suivants se déclenche au bon moment
- [ ] L'indicateur de chargement est visible pendant le chargement
- [ ] Tous les événements sont accessibles par défilement
- [ ] La position de défilement est maintenue après rechargement

### 4.4 Interaction avec les événements
- [ ] Le clic sur un événement ouvre la modale
- [ ] La modale affiche les informations complètes
- [ ] Le bouton de fermeture fonctionne
- [ ] L'échap ferme la modale
- [ ] Le clic en dehors de la modale la ferme

### 4.5 Gestion des erreurs
- [ ] Un message clair s'affiche en cas d'erreur
- [ ] Le bouton de réessai fonctionne
- [ ] Les erreurs réseau sont correctement gérées
- [ ] Les données partielles s'affichent malgré les erreurs partielles

### 4.6 Réactivité et accessibilité
- [ ] L'interface s'adapte au mobile
- [ ] Les contrôles sont accessibles au clavier
- [ ] Les contrastes sont suffisants
- [ ] Les temps de réponse sont acceptables sur connexion lente
- [ ] Le mode hors-ligne est géré élégamment

## 5. Tests de performance

### 5.1 Outils
- [ ] Lighthouse (Performance, Accessibilité, Bonnes pratiques, SEO)
- [ ] Chrome DevTools (Performance, Réseau, Mémoire)
- [ ] React DevTools (Re-rendus, Profiling)

### 5.2 Métriques à mesurer
- **Temps de chargement initial** : < 2s
- **Temps d'interactivité** : < 3.5s
- **Score Lighthouse** : > 90/100
- **Mémoire utilisée** : < 100MB
- **Taille du bundle** : < 500KB

### 5.3 Scénarios de charge
- [ ] 100 événements
- [ ] 500 événements
- [ ] 1000+ événements
- [ ] Connexion lente (Fast 3G)
- [ ] CPU limité (6x slowdown)

## 6. Tests multi-navigateurs
- [ ] Chrome (dernière version)
- [ ] Firefox (dernière version)
- [ ] Edge (dernière version)
- [ ] Safari (si Mac disponible)

## 7. Tests mobiles
- [ ] Téléphone Android (Chrome)
- [ ] iPhone (Safari)
- [ ] Tablette (orientation portrait/paysage)

## 8. Documentation des tests

### 8.1 Résultats des tests
```
Date du test : [DATE]
Testeur : [NOM]
Environnement : [LOCAL/STAGING/PROD]
Navigateur : [NAVIGATEUR/VERSION]

Résumé :
- Tests fonctionnels : X/Y réussis
- Performance : [SCORE] (Lighthouse)
- Problèmes identifiés : [LISTE]
- Bloquants : [OUI/NON]
```

### 8.2 Modèle de rapport de bug
```
## Titre du bug

**Description** : [Description claire du problème]
**Étapes pour reproduire** :
1. [Étape 1]
2. [Étape 2]
3. [Étape 3]

**Comportement attendu** : [Description]
**Comportement actuel** : [Description]
**Capture d'écran** : [LIEN]
**Environnement** : [Navigateur, OS, Taille d'écran]
**Priorité** : [Haute/Moyenne/Basse]
```

## 9. Plan de déploiement

### 9.1 Pré-déploiement
- [ ] Tests manuels complets
- [ ] Validation des performances
- [ ] Revue de code
- [ ] Sauvegarde de la base de données

### 9.2 Déploiement
- [ ] Déploiement sur staging
- [ ] Tests de régression
- [ ] Validation par l'équipe produit
- [ ] Déploiement en production

### 9.3 Post-déploiement
- [ ] Surveillance des erreurs
- [ ] Vérification des performances en production
- [ ] Retour utilisateur

## 10. Rétrospective

### 10.1 Points positifs
- [ ] [À compléter après les tests]

### 10.2 Points d'amélioration
- [ ] [À compléter après les tests]

### 10.3 Actions correctives
- [ ] [À compléter après les tests]
