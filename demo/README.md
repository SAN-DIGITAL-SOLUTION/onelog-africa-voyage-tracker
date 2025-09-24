# Démo OneLog Africa – Lancement rapide & fiable

## Stack démo
- **App Next.js** (prod, user non-root, image légère)
- **PostgreSQL 15** (persistant, healthcheck intégré)
- **pgAdmin 4** (interface graphique DB)
- **Docker Compose** (orchestration, build context optimisé)

---

## 🚀 Lancer la démo

```bash
cd demo
# (optionnel) docker-compose down pour tout stopper avant
# Build ultra-rapide & lancement de tous les services
docker-compose up --build
```

- **App Next.js** : http://localhost:3000
- **pgAdmin** : http://localhost:5050 (login : `admin@onelog.africa` / `onelog123`)
- **Postgres** : port 5432 (user: onelog, pass: secret, db: onelogdb)

---

## 🛑 Arrêter la démo
```bash
docker-compose down
```

---

## Checklist & bonnes pratiques
- Docker Desktop **doit** être démarré avant toute commande.
- Le build initial doit transférer **moins de 2 Mo** (grâce au `.dockerignore` optimisé).
- Les logs détaillés s’affichent dans le terminal (`docker-compose logs --tail=100`).
- Si un port est déjà utilisé, arrêtez les autres projets Docker.
- Pour tout souci, vérifiez les logs et la configuration des ports.

---

## Structure technique
- `Dockerfile` à la racine (multi-stage, prod only, user non-root)
- `.dockerignore` à la racine (exclut node_modules, .next, .git, etc.)
- `demo/docker-compose.yml` (context: .., healthcheck, network dédié)

---

## Dépannage rapide
- Si le build est **lent** (>2 Mo transférés), vérifiez `.dockerignore`.
- Si l’app ne démarre pas :
  - Vérifiez les logs (`docker-compose logs`)
  - Vérifiez que Docker Desktop tourne
  - Vérifiez les ports libres (3000, 5432, 5050)
- Pour toute erreur npm, vérifiez la section "scripts" et les dépendances dans `package.json`.

---

## Pour aller plus loin
- Ajoutez vos propres variables d’environnement dans `demo/docker-compose.yml`.
- Consultez la roadmap (`ROADMAP_SUIVI_AUTO.md`) pour les prochaines évolutions.
- Voir la doc technique pour la structure avancée, CI/CD, tests, surveillance, etc.
