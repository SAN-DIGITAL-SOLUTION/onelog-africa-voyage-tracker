# Fiche QA Chauffeur – Dashboard, Missions, Notifications, Sécurité

| #  | Scénario                         | Rôle        | Statut du compte | Entrée                                    | Comportement attendu                                   | Résultat attendu                    | Message affiché                 |
| -- | -------------------------------- | ----------- | ---------------- | ----------------------------------------- | ------------------------------------------------------ | ----------------------------------- | ------------------------------- |
| 1  | Connexion via email/mot de passe | Chauffeur   | actif            | Email + Mot de passe valides              | Redirection vers `/chauffeur/dashboard`                | Dashboard chargé                    | –                               |
| 2  | Connexion sans rôle `chauffeur`  | Utilisateur | actif            | Email + Mot de passe valides              | Blocage + redirection vers page d’erreur ou onboarding | Accès refusé                        | "Accès non autorisé"            |
| 3  | Affichage missions assignées     | Chauffeur   | actif            | Session ouverte                           | Récupération des missions via `getChauffeurMissions()` | Liste des missions affichée         | –                               |
| 4  | Aucune mission assignée          | Chauffeur   | actif            | Aucune mission en base                    | Message d’absence                                      | Message : "Aucune mission en cours" | "Aucune mission en cours."      |
| 5  | Affichage notifications          | Chauffeur   | actif            | Notifications en base                     | Section notifications visible                          | Liste notifications affichée        | –                               |
| 6  | Aucune notification              | Chauffeur   | actif            | Vide                                      | Message d’absence                                      | "Aucune notification"               | "Aucune notification."          |
| 7  | Check-in sur mission en cours    | Chauffeur   | actif            | Bouton check-in sur mission active        | Marquage du check-in avec horodatage                   | Check-in enregistré dans base       | "Check-in effectué à [heure]"  |
| 8  | Check-out après check-in         | Chauffeur   | actif            | Bouton check-out visible                  | Marquage du check-out avec horodatage                  | Check-out enregistré                | "Check-out effectué à [heure]" |
| 9  | Accès tracking mission           | Chauffeur   | actif            | Mission sélectionnée avec tracking activé | Affichage Google Maps avec position                    | Position affichée et mise à jour    | –                               |
| 10 | Déconnexion                      | Chauffeur   | actif            | Bouton déconnexion                        | Redirection vers `/login`                              | Session détruite                    | –                               |

---

Chaque scénario peut être converti facilement en test Cypress E2E, en test unitaire, ou en test de charge.
