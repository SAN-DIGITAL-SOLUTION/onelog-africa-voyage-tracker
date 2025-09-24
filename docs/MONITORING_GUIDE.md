# 🛡️ Guide Monitoring & Observabilité – OneLog Africa

## 1. Healthcheck applicatif (déjà en place)
- Endpoint : `/api/health` (statut JSON, timestamp)
- Utilisé par Docker HEALTHCHECK

## 2. Supervision simple avec Uptime Kuma
- Déployer Uptime Kuma (Docker, VPS, cloud)
- Ajouter un "HTTP(s) monitor" sur `http://<host>:3000/api/health`
- Recevoir alertes mail/Telegram/Slack en cas d’indisponibilité
- [Uptime Kuma GitHub](https://github.com/louislam/uptime-kuma)

## 3. Monitoring avancé (Prometheus + Grafana)
- Déployer un node_exporter (pour stats système) et Prometheus
- Ajouter un job Prometheus pour scraper `/api/health` (probes HTTP)
- Visualiser les dashboards dans Grafana (alerting, historique)
- [Prometheus](https://prometheus.io/docs/prometheus/latest/getting_started/), [Grafana](https://grafana.com/docs/grafana/latest/getting-started/)

## 4. Intégration cloud (UptimeRobot, StatusCake, etc.)
- Ajouter le endpoint `/api/health` dans votre outil cloud préféré
- Recevoir alertes et rapports sans infra supplémentaire

---

## Exemple de configuration Uptime Kuma (docker-compose)
```yaml
uptime-kuma:
  image: louislam/uptime-kuma:1
  ports:
    - "3001:3001"
  volumes:
    - ./uptime-kuma-data:/app/data
```

---

## Conseils
- Toujours exposer un endpoint de healthcheck pour chaque microservice
- Centraliser les alertes (mail, Slack, etc.)
- Documenter la procédure pour l’équipe (onboarding, support)
