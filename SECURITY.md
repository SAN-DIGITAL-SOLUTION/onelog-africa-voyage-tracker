# Sécurité et vulnérabilités connues

## Vulnérabilités npm restantes

Au 20 juin 2025, après correction automatique (`npm audit fix --force`), il subsiste 3 vulnérabilités modérées dans les dépendances suivantes :

- **esbuild** (dépendance de Vite)
- **vite** (0.11.0 à 6.1.6)
- **lovable-tagger** (dépendance de vite)

### Détail
- **esbuild** : permet à un site web d’envoyer des requêtes au serveur de dev et d’en lire la réponse ([GHSA-67mh-4wv8-2f99](https://github.com/advisories/GHSA-67mh-4wv8-2f99)).
- **vite** : dépend d’esbuild vulnérable.
- **lovable-tagger** : dépend de vite vulnérable.

### Statut
- **Aucun correctif officiel disponible** à ce jour (voir [issues GitHub Vite](https://github.com/vitejs/vite/issues)).
- **Aucune vulnérabilité critique** n’affecte la production (ces failles concernent le serveur de développement).
- **Surveillance** : mettre à jour Vite et esbuild dès qu’un patch sera publié.

## Recommandations
- Ne pas exposer le serveur de développement à internet/public.
- Utiliser uniquement le build de production en environnement réel.
- Vérifier régulièrement les mises à jour de Vite/esbuild.

---

Dernière mise à jour : 20/06/2025
Responsable : Équipe technique OneLog Africa
