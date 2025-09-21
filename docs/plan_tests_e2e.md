# Plan de Tests de Bout en Bout (E2E) - OneLog Africa

**Objectif :** Valider le parcours utilisateur complet pour chaque rôle principal afin de garantir la stabilité, la cohérence des données et l'absence de régressions avant de passer à la validation de la sécurité (RLS).

---

### Scénario 1 : Parcours Client

| Étape | Action | Résultat Attendu | Statut |
| :--- | :--- | :--- | :--- |
| 1.1 | **Inscription** | Créer un compte avec le rôle `client`. | L'utilisateur reçoit un email de confirmation et peut se connecter. | `À FAIRE` |
| 1.2 | **Onboarding** | Compléter le processus d'onboarding. | Le statut de l'onboarding est sauvegardé, l'utilisateur est redirigé vers son tableau de bord. | `À FAIRE` |
| 1.3 | **Création Demande** | Remplir et soumettre le formulaire de demande de transport. | La demande apparaît dans la base de données avec le statut `en_attente`. Le client voit sa demande dans son interface. | `À FAIRE` |
| 1.4 | **Suivi Demande** | Consulter le statut de sa demande. | Le statut passe de `en_attente` à `validee`, puis `en_cours` et enfin `livree`. | `À FAIRE` |

---

### Scénario 2 : Parcours Exploitant

| Étape | Action | Résultat Attendu | Statut |
| :--- | :--- | :--- | :--- |
| 2.1 | **Connexion** | Se connecter avec un compte `exploiteur`. | Accès au tableau de bord exploitant avec les bonnes statistiques. | `À FAIRE` |
| 2.2 | **Gestion Demande** | Naviguer vers `/demandes-exploitant` et valider une demande `en_attente`. | La demande passe au statut `validee` et disparaît de la liste des demandes en attente. | `À FAIRE` |
| 2.3 | **Affectation Chauffeur** | Naviguer vers `/affectations`, sélectionner la demande validée et un chauffeur `disponible`. | Une nouvelle mission est créée dans la table `missions`. La demande disparaît de la page d'affectation. | `À FAIRE` |
| 2.4 | **Suivi Temps Réel** | Naviguer vers `/control-room`. | La carte affiche les véhicules en temps réel. Les filtres sont fonctionnels. | `À FAIRE` |

---

### Scénario 3 : Parcours Chauffeur

| Étape | Action | Résultat Attendu | Statut |
| :--- | :--- | :--- | :--- |
| 3.1 | **Connexion** | Se connecter avec un compte `chauffeur`. | Accès à la page `MissionsChauffeur` affichant les missions assignées. | `À FAIRE` |
| 3.2 | **Démarrer Mission** | Cliquer sur "Démarrer" sur une mission `en_attente`. | Le statut de la mission passe à `en_cours`. | `À FAIRE` |
| 3.3 | **Livrer Mission** | Cliquer sur "Livré" sur une mission `en_cours`. | Le statut de la mission passe à `livree`. | `À FAIRE` |
| 3.4 | **Clôturer Mission** | Cliquer sur "Clôturer" sur une mission `livree`. | Le statut de la mission passe à `cloturee`. La mission peut être archivée ou disparaître de la vue principale. | `À FAIRE` |

---

### Scénario 4 : Vérification de la Sécurité (RLS)

| Rôle | Action | Résultat Attendu | Statut |
| :--- | :--- | :--- | :--- |
| Client | Tenter d'accéder à `/demandes-exploitant`. | Accès refusé ou redirection. | `À FAIRE` |
| Chauffeur | Tenter d'accéder à `/affectations`. | Accès refusé ou redirection. | `À FAIRE` |
| Exploitant | Tenter d'accéder à une mission d'une autre organisation (si applicable). | Accès refusé. | `À FAIRE` |
| Chauffeur | Tenter de voir les missions d'un autre chauffeur. | Accès refusé. | `À FAIRE` |
