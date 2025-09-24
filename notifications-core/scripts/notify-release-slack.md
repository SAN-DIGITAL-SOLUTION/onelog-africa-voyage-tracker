# Notification Slack post-release (CI/CD)

## Fonctionnement

À chaque publication d’une release (npm), un message est envoyé automatiquement sur Slack via un webhook.

- Le workflow GitHub Actions `publish-notifications-core.yml` contient un job `notify` qui utilise l’action officielle `slackapi/slack-github-action`.
- Le message notifie l’équipe d’une nouvelle release, avec lien vers changelog et doc API.

## Configuration

1. Crée un webhook entrant dans ton espace Slack (https://api.slack.com/apps > Incoming Webhooks).
2. Ajoute le webhook comme secret GitHub : `SLACK_WEBHOOK_URL` dans les Settings du repo.
3. Le message Slack sera envoyé automatiquement à chaque release publiée.

## Personnalisation

- Tu peux adapter le texte, le canal, ou enrichir le payload JSON selon tes besoins (voir la doc officielle Slack API).
- Pour Teams ou email, adapte le job en utilisant une action dédiée ou un script custom.

---

*Pour toute question, contacte un mainteneur ou consulte le workflow CI.*
