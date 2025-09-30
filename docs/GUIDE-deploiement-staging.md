# Guide de déploiement en staging / préproduction

## 1. Pré-requis
- Avoir accès à l’infrastructure de staging (serveur, Netlify, Vercel, VPS, etc.).
- Accès aux variables d’environnement nécessaires (Supabase, API keys…).
- Tag ou branche stable disponible (`v1.0.0`).

## 2. Procédure générale
1. **Cloner le dépôt ou se positionner sur le serveur staging**
   ```sh
   git clone https://github.com/sergeahiwa/onelog-africa-voyage-tracker.git
   cd onelog-africa-voyage-tracker
   git checkout v1.0.0
   ```
2. **Configurer les variables d’environnement**
   - Copier `.env.example` en `.env` et renseigner les valeurs nécessaires.
3. **Installer les dépendances**
   ```sh
   npm install --legacy-peer-deps
   # ou pnpm install
   ```
4. **Lancer le build de production**
   ```sh
   npm run build
   ```
5. **Démarrer le serveur**
   ```sh
   npm run preview
   # ou selon la stack (pm2, docker-compose, etc.)
   ```
6. **Vérifier l’accès à l’application**
   - Naviguer sur l’URL de staging et effectuer les tests QA.

## 3. Bonnes pratiques
- Ne jamais utiliser les credentials de prod en staging.
- Nettoyer les données sensibles après test.
- Noter les retours utilisateurs pour la roadmap.

---

*Adapter selon la stack et l’infra de l’équipe.*
