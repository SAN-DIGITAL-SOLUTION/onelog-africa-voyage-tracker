### 🧪 Tests UI – Module Profils Utilisateurs

Cette page décrit la stratégie de tests UI pour les composants et pages du module `userProfiles`, incluant :

* ✅ Tests unitaires
* ✅ Tests d'accessibilité (a11y)
* ✅ Tests de snapshot
* 🔄 Tests d’intégration E2E (via Cypress, à venir)

---

#### 📁 Arborescence des tests

```
src/modules/userProfiles/
├── components/
│   ├── __tests__/
│   │   ├── Button.test.tsx
│   │   ├── Layout.test.tsx
│   │   ├── UserCard.test.tsx
│   │   ├── UserCard.a11y.test.tsx
│   │   ├── UserCard.snapshot.test.tsx
│   │   └── UserForm.test.tsx
```

---

### ✅ Tests unitaires

* **But** : Valider le rendu des composants avec différents `props`, comportement interactif, props obligatoires, etc.
* **Outils** : [`@testing-library/react`](https://testing-library.com/docs/react-testing-library/intro/), [`Vitest`](https://vitest.dev/)

Exemple :

```tsx
// Button.test.tsx
it('affiche le bouton secondaire', () => {
  const { getByRole } = render(<Button variant="secondary">Envoyer</Button>);
  expect(getByRole('button')).toHaveTextContent('Envoyer');
});
```

---

### ♿️ Tests d'accessibilité (a11y)

* **But** : Détecter les erreurs ARIA, contrastes, focus, etc.
* **Outils** : [`jest-axe`](https://github.com/nickcolley/jest-axe)

Exemple :

```tsx
// UserCard.a11y.test.tsx
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);
it('n’a pas de violation a11y', async () => {
  const { container } = render(<UserCard user={{ id: '1', name: 'Jane', role: 'user' }} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

### 📸 Tests de snapshot

* **But** : Vérifier que le rendu DOM ne change pas de façon inattendue.
* **Outils** : [`Vitest`](https://vitest.dev/)

Exemple :

```tsx
// UserCard.snapshot.test.tsx
it('correspond au snapshot', () => {
  const { container } = render(<UserCard user={{ id: '1', name: 'Jane', role: 'admin' }} />);
  expect(container).toMatchSnapshot();
});
```

---

### 🚀 Exécution des tests

Commandes à lancer depuis la racine du module :

```bash
npm run test       # Lance tous les tests
npx vitest --ui    # Interface de tests interactive
```

---

### 📌 Prochaines étapes

* Intégration de Cypress pour les tests E2E sur les pages `/user-list`, `/[id]`, `/edit`
* Couverture des tests : badge dans le README
* Intégration continue : exécution automatique via GitHub Actions

---

### ✅ MATRICE DE TESTS — Profils Utilisateurs (version enrichie)

| **Catégorie**        | **ID**  | **Scénario**                                                            | **Priorité** | **Type**       | **Statut** |
| -------------------- | ------- | ----------------------------------------------------------------------- | ------------ | -------------- | ---------- |
| Authentification     | AUTH-01 | Accès refusé si l’utilisateur non connecté tente d’accéder à /user-list | Haute        | E2E / Sécurité | À tester   |
| Authentification     | AUTH-02 | Redirection vers /login si l’utilisateur non authentifié                | Haute        | E2E            | À tester   |
| Authentification     | AUTH-03 | Affichage du nom de l’utilisateur connecté dans le layout               | Moyenne      | UI             | À tester   |
| Authentification     | AUTH-04 | Expiration de session : redirection automatique vers /login              | Haute        | E2E / Sécurité | À tester   |
| Rôles & autorisation | ROLE-01 | Un rôle "admin" peut modifier les profils                             | Haute        | Fonctionnel    | À tester   |
| Rôles & autorisation | ROLE-02 | Un rôle "viewer" ne peut pas voir le bouton "Modifier"              | Haute        | UI / Sécurité  | À tester   |
| Rôles & autorisation | ROLE-03 | Un rôle "client" ne peut accéder qu’à son propre profil               | Haute        | Sécurité/E2E   | À tester   |
| CRUD Profil          | CRUD-01 | Liste des utilisateurs affichée correctement (user-list.tsx)            | Haute        | Fonctionnel    | ✅ OK       |
| CRUD Profil          | CRUD-02 | Affichage correct des données d’un utilisateur (profil.tsx)             | Haute        | Fonctionnel    | ✅ OK       |
| CRUD Profil          | CRUD-03 | Édition du profil avec succès (edit.tsx + Supabase)                     | Haute        | E2E / API      | ✅ OK       |
| CRUD Profil          | CRUD-04 | Message d’erreur si profil inexistant                                   | Haute        | Fonctionnel    | À tester   |
| UI                   | UI-01   | Bouton Modifier s’affiche uniquement si onEdit fourni                   | Moyenne      | Test unitaire  | ✅ OK       |
| UI                   | UI-02   | Formulaire affiche correctement les champs nom + rôle                   | Haute        | Test unitaire  | ✅ OK       |
| UI                   | UI-03   | Affichage responsive sur mobile                                         | Moyenne      | E2E/UI         | À tester   |
| UI                   | UI-04   | Affichage d’un loader lors du chargement                                | Moyenne      | UI             | ✅ OK       |
| Accessibilité (a11y) | A11Y-01 | Tous les boutons ont un rôle accessible                                 | Moyenne      | a11y / axe     | ✅ OK       |
| Accessibilité (a11y) | A11Y-02 | Le layout est navigable au clavier                                      | Moyenne      | E2E            | À tester   |
| Accessibilité (a11y) | A11Y-03 | Contraste suffisant pour les textes et boutons                          | Haute        | a11y           | À tester   |
| Snapshots UI         | SNAP-01 | Layout global : snapshot stable                                         | Moyenne      | Snapshot       | ✅ OK       |
| Snapshots UI         | SNAP-02 | UserForm et UserCard : rendu visuel validé                              | Moyenne      | Snapshot       | ✅ OK       |
| Sécurité API         | SEC-01  | Les appels Supabase sont filtrés par utilisateur connecté               | Haute        | Sécurité / API | À tester   |
| Sécurité API         | SEC-02  | Tentative d’élévation de privilège bloquée                              | Haute        | Sécurité/E2E   | À tester   |
| Résilience           | RES-01  | Gestion d’erreur si Supabase échoue                                     | Haute        | API            | À tester   |
| Résilience           | RES-02  | Message utilisateur en cas d’erreur réseau                              | Moyenne      | UI             | À tester   |
| Tests E2E            | E2E-01  | Navigation complète : liste → profil → édition → retour                 | Haute        | E2E            | ✅ OK       |
| Tests E2E            | E2E-02  | Message de succès affiché après édition                                 | Moyenne      | E2E            | ✅ OK       |
| UX                   | UX-01   | Focus automatique sur le premier champ du formulaire                    | Basse        | UX/E2E         | À tester   |
| UX                   | UX-02   | Retour utilisateur après déconnexion                                    | Moyenne      | UX/E2E         | À tester   |
| Performance          | PERF-01 | Chargement de la liste < 2s avec 100 utilisateurs                       | Moyenne      | Perf/E2E       | À tester   |
| Internationalisation | I18N-01 | Textes affichés en français et anglais selon la langue                  | Basse        | UI/E2E         | À tester   |

---
