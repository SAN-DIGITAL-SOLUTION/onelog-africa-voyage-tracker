import os
import requests

# Configuration
REPO = "sergeahiwa/onelog-africa-voyage-tracker"  # Modifier si besoin
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")  # À définir dans l'environnement

HEADERS = {
    "Authorization": f"token {GITHUB_TOKEN}",
    "Accept": "application/vnd.github+json"
}

ISSUES = [
    {
        "title": "Sprint 1 - Refonte UI formulaire profil",
        "body": "Refondre l'interface du formulaire profil utilisateur pour une meilleure ergonomie, accessibilité et cohérence visuelle.\n\nCritères d'acceptation :\n- Design validé par l'équipe\n- Accessibilité (navigation clavier, labels, contrastes)\n- Feedback visuel (chargement, erreurs, succès)",
        "labels": ["sprint1", "ux", "enhancement"]
    },
    {
        "title": "Sprint 1 - Ajout avatar dynamique",
        "body": "Permettre à l'utilisateur de choisir ou générer un avatar dynamique pour son profil.\n\nCritères d'acceptation :\n- Sélection avatar depuis galerie ou upload\n- Génération avatar (optionnel)\n- Persistance et affichage correct",
        "labels": ["sprint1", "avatar", "enhancement"]
    },
    {
        "title": "Sprint 1 - Amélioration performance Google Maps",
        "body": "Optimiser le chargement et l'expérience utilisateur sur la carte Google Maps (missions/tracking).\n\nCritères d'acceptation :\n- Lazy loading des assets\n- Temps de chargement inférieurs à 2s\n- Fluidité et réactivité sur desktop/mobile",
        "labels": ["sprint1", "performance", "enhancement"]
    }
]

def create_issue(issue):
    url = f"https://api.github.com/repos/{REPO}/issues"
    response = requests.post(url, headers=HEADERS, json=issue)
    if response.status_code == 201:
        print(f"✔️ Issue créée : {issue['title']}")
    else:
        print(f"❌ Erreur création issue : {issue['title']} - {response.status_code}")
        print(response.json())

if __name__ == "__main__":
    if not GITHUB_TOKEN:
        print("Veuillez définir la variable d'environnement GITHUB_TOKEN.")
        exit(1)
    for issue in ISSUES:
        create_issue(issue)
