# notifications-core Web UI

Interface Next.js pour la gestion et l’édition des templates de notifications.

## Fonctionnalités prévues
- Authentification admin simple
- Upload, édition, suppression de templates (txt/html)
- Aperçu live avec variables fictives
- Test d’envoi (mock)

---

## 🔒 Politique de sécurité pour l’interface admin

**Objectif**
Garantir que le mot de passe d’administration n’est jamais exposé côté client et que l’accès aux pages sensibles est strictement contrôlé.

**Mise en œuvre**
- Le mot de passe admin est stocké uniquement côté serveur dans `.env.local` sous la variable `ADMIN_PASSWORD`.
- L’API route `/api/login` reçoit le mot de passe via une requête POST, le valide côté serveur, et pose un cookie HTTPOnly `auth=1` en cas de succès.
- Le frontend ne contient jamais de secret ni de mot de passe en clair.
- Les pages sensibles (ex : `/templates`) sont protégées via une vérification serveur (`getServerSideProps` ou middleware) qui valide la présence et la validité du cookie `auth`.
- En cas d’absence ou d’expiration du cookie, redirection vers `/login`.
- Le flux d’authentification est sécurisé, simple et protège contre les fuites de secret.

**Bonnes pratiques collaboratives**
- Toute modification liée à l’authentification doit impérativement respecter ce principe.
- En cas de nécessité d’évolution (multi-utilisateurs, audit, permissions fines), demander une revue formelle avant implémentation.
- Le mot de passe admin ne doit jamais être référencé ou commité dans le frontend.
- Le cookie d’authentification doit toujours être HTTPOnly et avoir une durée de vie maîtrisée.
- Les équipes doivent communiquer toute modification impactant la sécurité à l’ensemble des collaborateurs.

## Démarrage local
```bash
cd notifications-core/web
npm install
npm run dev
```

Accès : http://localhost:3000

## Structure
- `pages/` : Entrées principales (login, dashboard, éditeur)
- `components/` : UI réutilisable (TemplateEditor, TemplateList, Preview, LoginForm)
- `lib/` : Fonctions utilitaires (gestion fichiers, auth, etc.)

## À compléter selon besoins métier.
