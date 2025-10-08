## 🧪 Documentation – Storybook & Tests

### 📚 Storybook – Visualisation des composants

Storybook permet de visualiser et tester visuellement les composants de l’interface (`Button`, `Layout`, etc.) de manière isolée.

#### ▶️ Lancer Storybook

```bash
npm run storybook
```

Cela démarre Storybook sur [http://localhost:6006](http://localhost:6006).

#### 🔨 Construire Storybook (pour déploiement)

```bash
npm run build-storybook
```

Le build est généré dans `.storybook-static/`.

#### 📁 Fichiers Storybook

* `.storybook/main.js` : configuration principale
* `.storybook/preview.js` : styles globaux & décorateurs
* `components/Button.stories.tsx` : variantes du composant `Button`
* `components/Layout.stories.tsx` : démonstration du layout de page

---

### ✅ Tests unitaires & visuels

Les tests sont écrits avec **Vitest** et **React Testing Library**.

#### ▶️ Lancer tous les tests

```bash
npm run test
```

#### ▶️ Lancer avec UI interactive

```bash
npm run test:ui
```

Cela ouvre une interface pour explorer les tests avec retour visuel.

#### 🧪 Bonnes pratiques

* Tous les composants doivent avoir :

  * Un fichier `*.test.tsx`
  * Un fichier `*.stories.tsx`
* Les hooks personnalisés peuvent être testés via `@testing-library/react-hooks`
* Les tests doivent viser au minimum **80% de couverture**

#### 📁 Structure recommandée

```
components/
  Button.tsx
  Button.test.tsx
  Button.stories.tsx
hooks/
  useUserProfile.ts
  useUserProfile.test.ts
```

---

### 📊 Rapports de couverture (optionnel)

Pour générer un rapport de couverture :

```bash
vitest run --coverage
```

Cela produit un rapport dans `coverage/` avec un index HTML.

---

### 🔗 Intégration CI

Les workflows GitHub Actions (ex: `userProfiles-ci.yml`) exécutent :

* Lint
* Tests unitaires
* Couverture
* Audit sécurité

Les badges sont visibles dans le `README.md` du module.

---
