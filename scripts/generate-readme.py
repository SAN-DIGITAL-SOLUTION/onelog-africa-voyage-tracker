import json
from pathlib import Path
from datetime import datetime
import sys

try:
    import markdown
except ImportError:
    markdown = None
try:
    import weasyprint
except ImportError:
    weasyprint = None

def generate_readme_from_json(json_path, readme_path, html_path=None, pdf_path=None):
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    now = datetime.now().strftime("%d/%m/%Y à %H:%M")
    source = Path(json_path).name

    lines = []
    lines.append(f"# 🚚 OneLog Africa – Suivi du Développement\n")
    lines.append(f"> 🕒 Mis à jour automatiquement le {now} depuis `{source}`\n\n")
    lines.append(f"OneLog Africa est une plateforme logistique panafricaine innovante. Ce document fournit un aperçu du développement actuel, des fonctionnalités livrées, des éléments en cours et des prochaines étapes.\n\n---\n")
    lines.append(f"## ✅ Avancement Global : **{data.get('progression', '?')} %**\n\n---\n")

    # Tableau de progression dynamique
    modules = data.get('modules', [])
    if modules:
        lines.append("## 📊 Tableau de progression\n")
        lines.append("| Module | Statut | Progression |\n|---|---|---|\n")
        for m in modules:
            prog = m.get('progress', '')
            if prog == '':
                # Tenter de déduire du statut
                prog = {'done': '100%', 'not_started': '0%', 'in_progress': m.get('progress', '?%')}.get(m.get('status',''), '?%')
            elif isinstance(prog, int):
                prog = f"{prog}%"
            lines.append(f"| {m.get('name','')} | {m.get('status','')} | {prog} |")
            # Sous-modules
            for sm in m.get('submodules', []):
                sm_prog = sm.get('progress', '')
                if sm_prog == '':
                    sm_prog = {'done': '100%', 'not_started': '0%', 'in_progress': sm.get('progress', '?%')}.get(sm.get('status',''), '?%')
                elif isinstance(sm_prog, int):
                    sm_prog = f"{sm_prog}%"
                lines.append(f"| &nbsp;&nbsp;&nbsp;↳ {sm.get('name','')} | {sm.get('status','')} | {sm_prog} |")
        lines.append("\n---\n")

    # Détail par module
    lines.append("## 🧩 État par module\n")
    for module in modules:
        lines.append(f"### {module.get('name', '')}\n- **Statut** : {module.get('status', '')}\n- **Détails** : {module.get('details', '')}\n")
        if 'submodules' in module:
            for sm in module['submodules']:
                lines.append(f"  - **{sm.get('name','')}** : {sm.get('status','')} – {sm.get('details','')}\n")
        lines.append("---\n")

    if 'missing_files' in data:
        lines.append("## 🔧 Fichiers à compléter\n")
        for f in data['missing_files']:
            lines.append(f"- `{f}`\n")
        lines.append("---\n")

    if 'next_steps' in data:
        lines.append("## 📍 Prochaines étapes\n")
        for i, step in enumerate(data['next_steps'], 1):
            lines.append(f"{i}. {step}\n")
        lines.append("---\n")

    lines.append("## 🧭 Suivi automatique\nCe fichier est généré à partir du suivi JSON. Il est mis à jour automatiquement (hooks/CI/CD).\n\n---\n")

    with open(readme_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)

    # Génération HTML (optionnelle)
    if html_path:
        html_content = "\n".join(lines)
        if markdown:
            html_content = markdown.markdown(html_content, extensions=['tables'])
        else:
            html_content = f"<pre>{html_content}</pre>"
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
    # Génération PDF (optionnelle, nécessite weasyprint)
    if pdf_path and weasyprint:
        if not html_path:
            html_content = "\n".join(lines)
            if markdown:
                html_content = markdown.markdown(html_content, extensions=['tables'])
            else:
                html_content = f"<pre>{html_content}</pre>"
        else:
            with open(html_path, 'r', encoding='utf-8') as f:
                html_content = f.read()
        weasyprint.HTML(string=html_content).write_pdf(pdf_path)
    elif pdf_path:
        print("[WARN] Impossible de générer le PDF : weasyprint non installé", file=sys.stderr)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Génère le README.md, un rapport HTML et PDF à partir d'un fichier JSON de suivi.")
    parser.add_argument('--json', default='project-status.json', help='Chemin du fichier JSON source')
    parser.add_argument('--readme', default='README.md', help='Chemin du README à générer')
    parser.add_argument('--html', default='project-report.html', help='Chemin du rapport HTML à générer')
    parser.add_argument('--pdf', default='project-report.pdf', help='Chemin du rapport PDF à générer')
    args = parser.parse_args()

    generate_readme_from_json(args.json, args.readme, html_path=args.html, pdf_path=args.pdf)
    print(f"README, rapport HTML et PDF générés à partir de {args.json}.")
