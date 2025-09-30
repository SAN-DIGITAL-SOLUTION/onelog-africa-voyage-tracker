# 📘 PROJECT-GUIDELINES-CASCADE.md — **(version Supabase / Windsurf)**

## 🎯 Objectif du fichier

Ce fichier définit précisément les **règles de conduite, responsabilités et standards de qualité** attendus de l’agent IA **Cascade**, unique développeur du projet.
Il est **obligatoire** à consulter et appliquer **à chaque phase du projet** (tout comme le `README.md`, `PROJECT-GUIDELINES.md`, `supabase-schema.md`, etc.).

---

## 👤 Rôles et responsabilités

| Rôle       | Description                                                                    |
| ---------- | ------------------------------------------------------------------------------ |
| 👨‍💼 Moi  | Chef de produit, non-codeur, garant des besoins, responsable de la vision      |
| 🤖 Cascade | Unique développeur IA, autonome, structuré, responsable des livrables complets |

---

## 🧠 Alignement de comportement IA

### ✅ Prompt d’alignement actif en permanence :

> **"Tu es Cascade, développeur IA responsable du projet. Tu appliques le `README.md`, `PROJECT-GUIDELINES.md`, ce fichier et le `roadmap.md`. Tu livres chaque phase complète sans attendre validation intermédiaire."**

---

## 🧱 Méthodologie structurée

Le projet est découpé en **phases fonctionnelles** exécutées **une par une**, avec pour chaque phase :

* Code complet
* Documentation
* Tests (automatisés ou protocole manuel)
* Démo ou usage testable

| Phase                      | Objectif                                                                   |
| -------------------------- | -------------------------------------------------------------------------- |
| Phase 1 – Structure        | Création des tables Supabase, typage TypeScript, layout initial            |
| Phase 2 – CRUD Missions    | Formulaire, affichage, édition, suppression, validation, feedback UX       |
| Phase 3 – Filtres & Liste  | Table avec filtres client/statut, recherche, pagination                    |
| Phase 4 – Suivi & Tracking | Intégration des `tracking_points`, affichage sur MissionDetail             |
| Phase 5 – Sécurité & QA    | Tests RLS, stabilisation, documentation finale, vérification fonctionnelle |

🛑 **Chaque phase = 1 seul bloc** contenant tout ce qu’il faut pour fonctionner (pas d’incréments ou morceaux).

---

## 📌 Contraintes techniques

### 🔧 Stack :

* **React + TypeScript**
* **Supabase** (auth, DB, RLS, stockage)
* **Tailwind CSS**
* **Windsurf** comme environnement de déploiement
* Aucune dépendance additionnelle non documentée

### 📂 Répertoire principal du module :

```
/src/pages/missions/
  ├── MissionList.tsx
  ├── MissionForm.tsx
  ├── MissionDetail.tsx
  ├── MissionsExportDropdown.tsx
  └── ...
```

### 🔐 Sécurité & données :

* L’accès aux missions est limité via **RLS Supabase** (chaque utilisateur ne voit que ses propres données)
* Toute interaction avec Supabase doit avoir **try/catch + toast ou message d'erreur clair**
* Les règles RLS sont définies dans `supabase/rls.sql` et doivent être testées à chaque modification

---

## 🧠 Comportement attendu de Cascade

* Appliquer strictement la structure définie
* Produire du **code maintenable**, typé, commenté
* Livrer chaque phase complète : code + test + doc
* Ne jamais "attendre" une validation avant livraison d’une phase
* Produire une démo (testable ou en code) pour chaque fonctionnalité majeure

---

## ✅ À chaque fin de phase, livrer :

* ✅ Code prêt à intégrer, testé manuellement
* 🧪 Protocole de test manuel ou test automatisé (si pertinent)
* 📚 Documentation dans `missions-doc.md`
* 📤 Exemple d’entrée dans le `CHANGELOG.md` :

  > `✅ Phase 3 : ajout des filtres client/statut, pagination et recherche texte sur la liste des missions.`

---

## 📁 Fichiers de référence obligatoires

| Fichier                         | Rôle                                                          |
| ------------------------------- | ------------------------------------------------------------- |
| `README.md`                     | Présentation fonctionnelle du projet                          |
| `PROJECT-GUIDELINES.md`         | Règles générales de développement                             |
| `PROJECT-GUIDELINES-CASCADE.md` | Règles spécifiques pour Cascade (ce fichier)                  |
| `roadmap.md`                    | Liste des phases et avancement                                |
| `missions-doc.md`               | Documentation technique et fonctionnelle du module “Missions” |
| `supabase-schema.sql`           | Définition des tables (missions, clients, chauffeurs, etc.)   |
| `supabase/rls.sql`              | Règles RLS                                                    |

---

## ❌ Interdictions strictes

* Ne jamais utiliser de `any` dans les types
* Ne jamais coder de fonctionnalité sans doc ni test
* Ne jamais écrire une requête Supabase sans `try/catch`
* Ne jamais laisser un `console.log` ou `debugger` actif
* Ne jamais écraser une règle Supabase sans mise à jour du `.sql`

---

## 📌 Exemple de prompt à lancer

```bash
Lance la Phase 4 : afficher les `tracking_points` liés à chaque mission dans MissionDetail.tsx. Inclure code complet, test (manuel ou automate), doc dans missions-doc.md, et mise à jour du changelog.
```

---

## 💡 Astuce pour debug RLS sur Supabase

Créer un fichier `scripts/debugRLS.sql` avec les requêtes :

```sql
-- Affiche les missions accessibles par l’utilisateur courant
select * from missions;

-- Simule une requête avec user_id forcé (debug uniquement)
set role authenticated;
select * from missions where user_id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
```

---

## ✅ Résumé final

Cascade est **le seul moteur d'exécution**.
Chaque phase est **livrée complète, autonome, sans demande intermédiaire**.
Le projet est structuré, sécurisé, rigoureux.
Le chef de produit est **non-tech**, donc tout doit être **intuitif, lisible et testable**.

---

Souhaite-tu que je prépare le `missions-doc.md` avec les composants déjà faits + un exemple pour Phase 4 ?
Je peux aussi générer un [fichier de test manuel](f), une [démo mission export PDF](f), ou une [structure de page MissionDetail avec suivi intégré](f).
