# 📄 missions-doc.md

## 📌 Objectif

Ce fichier documente **tous les composants, pages et fonctionnalités du module Missions**.  
Il sert de référence technique et fonctionnelle pour la maintenance, les tests, et l’évolution du projet.

---

## ✅ Fonctionnalités déjà disponibles

| Fonction                       | Composant / Fichier                     | Description                                                                 |
| ----------------------------- | --------------------------------------- | --------------------------------------------------------------------------- |
| 🕵️ Liste des missions         | `MissionList.tsx`                       | Affiche toutes les missions accessibles à l'utilisateur                     |
| ➕ Création d’une mission     | `MissionForm.tsx`                       | Formulaire complet (client, chauffeur, dates, description, statut)          |
| 📝 Édition d’une mission      | `MissionForm.tsx` (mode édition)        | Réutilise le même formulaire avec valeurs préremplies                       |
| ❌ Suppression de mission     | `MissionList.tsx` + `supabase.ts`       | Suppression sécurisée avec confirmation                                     |
| 📃 Détail d’une mission       | `MissionDetail.tsx`                     | Affiche toutes les infos + tracking_points intégrés (Phase 4 réalisée)      |
| ⬇️ Export PDF/CSV            | `MissionsExportDropdown.tsx`            | Utilise `jspdf`, `jspdf-autotable` et export CSV pour la liste des missions |
| 🔍 Recherche & filtres        | `MissionList.tsx`                       | Filtres par client, statut + champ de recherche texte                       |
| 🔒 Sécurité RLS               | Supabase (`supabase/rls.sql`)           | L’utilisateur ne voit que ses missions, testable via SQL ou interface       |
| 🦶 Footer refactorisé         | `Footer.tsx`                            | Nouveau design, responsive, informations légales et liens utiles            |

---

## 🧱 Structures Supabase

### 🧾 Table `missions`

| Champ           | Type        | Description                       |
|----------------|-------------|-----------------------------------|
| `id`           | uuid        | Clé primaire                      |
| `client_id`    | uuid        | Référence vers la table `clients` |
| `driver_id`    | uuid        | Référence vers la table `drivers` |
| `status`       | text        | Enum (`en_cours`, `livrée`, etc.) |
| `start_date`   | timestamp   | Date de départ                    |
| `end_date`     | timestamp   | Date de livraison prévue          |
| `description`  | text        | Instructions ou notes             |
| `user_id`      | uuid        | ID du créateur (lié à auth.user)  |

---

## 🧾 Table `tracking_points`

| Champ         | Type        | Description                                        |
|--------------|-------------|----------------------------------------------------|
| `id`         | uuid        | Clé primaire                                       |
| `mission_id` | uuid        | Référence vers `missions.id`                       |
| `label`      | text        | Description (ex : “Départ dépôt”, “Arrivée client”) |
| `timestamp`  | timestamp   | Horodatage du point de suivi                        |

---

## 📦 Composants principaux

### 🧩 `MissionList.tsx`

- Table responsive affichant les missions
- Filtres par statut et client (select)
- Recherche texte par description
- Bouton `Créer une mission`
- Boutons d’action (Détail / Éditer / Supprimer)

### 🧩 `MissionForm.tsx`

- Formulaire contrôlé avec validation
- Sélection client / chauffeur via dropdown
- Date de départ / date de livraison
- Description, statut (select)
- `mode="create"` ou `mode="edit"`

### 🧩 `MissionDetail.tsx` (base actuelle)

- Affiche les champs principaux de la mission
- Prépare l’intégration des `tracking_points` (cf. Phase 4 ci-dessous)

---

## 🚀 Phase 4 : intégration du suivi (tracking_points)

### ✅ Objectif

Afficher dans `MissionDetail.tsx` la **liste chronologique des `tracking_points`** liés à la mission.

### 🔌 Requête Supabase (implémentation réelle)

```ts
const { data: trackingPoints, error } = await supabase
  .from('tracking_points')
  .select('*')
  .eq('mission_id', missionId)
  .order('recorded_at', { ascending: true });
```

### 📦 Format réel d’un tracking point

```ts
{
  id: string | number;
  latitude: number;
  longitude: number;
  recorded_at: string; // horodatage ISO
}
```

### 🧩 Composant utilisé : `MissionTrackingHistory`

Dans le code, les points sont transformés pour affichage :
```ts
return (data || []).map((pt) => ({
  id: pt.id,
  label: `Lat: ${pt.latitude.toFixed(5)}, Lng: ${pt.longitude.toFixed(5)}`,
  timestamp: new Date(pt.recorded_at).toLocaleString(),
}));
```

Affichage dans MissionDetail :
```tsx
<MissionTrackingHistory points={trackingPoints || []} />
```

- Si aucun point : affichage d’un message adapté dans le composant.
- Si erreur : gestion via les états d’erreur du hook React Query.

### 🧪 Tests manuels à faire (Phase 4)
- ✅ Une mission sans tracking_points → message vide
- ✅ Une mission avec plusieurs points → liste triée, affichage lisible
- ✅ Cas erreur Supabase → toast ou message d’échec
- ✅ Affichage OK sur mobile / desktop

### 📤 Mise à jour du CHANGELOG.md

```md
✅ Phase 4 : affichage des points de suivi par mission dans MissionDetail.tsx via MissionTrackingHistory
```

🧪 Tests manuels à faire (Phase 4)
- ✅ Une mission sans tracking_points → message vide
- ✅ Une mission avec plusieurs points → liste triée, affichage lisible
- ✅ Cas erreur Supabase → toast ou message d’échec
- ✅ Affichage OK sur mobile / desktop

📤 Mise à jour du CHANGELOG.md

```md
✅ Phase 4 : affichage des points de suivi par mission dans MissionDetail.tsx
```

📌 Prochaine étape

```bash
Lance la Phase 4 : afficher les `tracking_points` liés à chaque mission dans MissionDetail.tsx. Inclure code complet, test (manuel ou automate), doc dans missions-doc.md, et mise à jour du changelog.
```
