# Fiche de tests QA automatisée - OneLog Africa

| Utilisateur                | UID                                 | Rôle      | Status      | Requested Role | Accès dashboard | Accès admin | Message attendu                |
|--------------------------- |-------------------------------------|-----------|-------------|---------------|-----------------|-------------|-------------------------------|
| norole@qa.test             | user-norole-uuid                    |           |             |               | ❌              | ❌          | Aucun rôle attribué            |
| pending@qa.test            | user-pending-uuid                   |           | pending     | client        | ❌              | ❌          | En attente de validation       |
| self@qa.test               | user-self-uuid                      | chauffeur | approved    |               | ✅              | ❌          | Bienvenue                     |
| admin@qa.test              | admin-uuid                          | admin     | approved    |               | ✅              | ✅          | Bienvenue admin                |

**Légende** : ✅ accès autorisé, ❌ accès refusé
