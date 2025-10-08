import argparse
import os
from pathlib import Path
import sys
import json

# Importer la fonction principale du script de génération
from .generate_readme import generate_readme

def init_project_tracker(target_dir=None):
    """Copie les fichiers modèles dans le projet courant."""
    import shutil
    base = Path(__file__).parent.parent
    target = Path(target_dir or os.getcwd()) / 'project-tracker'
    if not target.exists():
        shutil.copytree(base, target, dirs_exist_ok=True, ignore=shutil.ignore_patterns("__pycache__", "*.pyc"))
    else:
        print(f"[WARN] Le dossier 'project-tracker' existe déjà.")
    print(f"Module project-tracker initialisé dans {target}")

def build_all(json_path, readme_path, template_path=None, html_path=None, pdf_path=None):
    generate_readme(json_path, readme_path, template_path, html_path, pdf_path)
    print(f"README, HTML et PDF générés à partir de {json_path}.")

def validate_json(json_path, schema_path):
    try:
        import jsonschema
    except ImportError:
        print("[ERREUR] Veuillez installer jsonschema : pip install jsonschema")
        sys.exit(1)
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    with open(schema_path, 'r', encoding='utf-8') as f:
        schema = json.load(f)
    jsonschema.validate(instance=data, schema=schema)
    print("Validation JSON : OK")

def render_template(template_str, context):
    for key, value in context.items():
        template_str = template_str.replace(f'{{{{{key}}}}}', str(value))
    return template_str

def build_changelog_entries(changelog):
    if not changelog:
        return "Aucune entrée."
    lines = []
    for entry in changelog:
        lines.append(f"### {entry['date']} – {entry['title']}\n{entry['details']}\n")
    return '\n'.join(lines)

def build_roadmap_section(roadmap, section):
    if not roadmap or section not in roadmap:
        return "Aucun objectif."
    return '\n'.join([f"- {item}" for item in roadmap[section]])

def generate_changelog(json_path, template_path, output_path):
    import json
    from datetime import datetime
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    with open(template_path, 'r', encoding='utf-8') as f:
        template = f.read()
    now = datetime.now().strftime("%d/%m/%Y à %H:%M")
    context = {
        'timestamp': now,
        'changelog_entries': build_changelog_entries(data.get('changelog', [])),
    }
    content = render_template(template, context)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"CHANGELOG généré dans {output_path}")

def generate_contributing(template_path, output_path):
    from datetime import datetime
    with open(template_path, 'r', encoding='utf-8') as f:
        template = f.read()
    now = datetime.now().strftime("%d/%m/%Y à %H:%M")
    context = {'timestamp': now}
    content = render_template(template, context)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"CONTRIBUTING généré dans {output_path}")

def generate_roadmap(json_path, template_path, output_path):
    import json
    from datetime import datetime
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    with open(template_path, 'r', encoding='utf-8') as f:
        template = f.read()
    now = datetime.now().strftime("%d/%m/%Y à %H:%M")
    roadmap = data.get('roadmap', {})
    context = {
        'timestamp': now,
        'roadmap_short': build_roadmap_section(roadmap, 'short'),
        'roadmap_medium': build_roadmap_section(roadmap, 'medium'),
        'roadmap_long': build_roadmap_section(roadmap, 'long'),
    }
    content = render_template(template, context)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"ROADMAP généré dans {output_path}")

def main():
    parser = argparse.ArgumentParser(description="CLI project-tracker : génération et validation de README dynamiques.")
    subparsers = parser.add_subparsers(dest="cmd")

    p_init = subparsers.add_parser('init', help="Initialise project-tracker dans le projet courant.")
    p_init.add_argument('--target', default=None, help="Répertoire cible.")

    p_build = subparsers.add_parser('build', help="Génère README, HTML, PDF.")
    p_build.add_argument('--json', default='../example.project-status.json')
    p_build.add_argument('--readme', default='../../README.md')
    p_build.add_argument('--template', default=None)
    p_build.add_argument('--html', default=None)
    p_build.add_argument('--pdf', default=None)

    p_val = subparsers.add_parser('validate', help="Valide le JSON via le schéma.")
    p_val.add_argument('--json', default='../example.project-status.json')
    p_val.add_argument('--schema', default='../project-status.schema.json')

    p_changelog = subparsers.add_parser('changelog', help="Génère le CHANGELOG.md à partir du JSON.")
    p_changelog.add_argument('--json', default='../example.project-status.json')
    p_changelog.add_argument('--template', default='../templates/changelog_template.md')
    p_changelog.add_argument('--output', default='../../CHANGELOG.md')

    p_contrib = subparsers.add_parser('contributing', help="Génère le CONTRIBUTING.md.")
    p_contrib.add_argument('--template', default='../templates/contributing_template.md')
    p_contrib.add_argument('--output', default='../../CONTRIBUTING.md')

    p_roadmap = subparsers.add_parser('roadmap', help="Génère le ROADMAP.md à partir du JSON.")
    p_roadmap.add_argument('--json', default='../example.project-status.json')
    p_roadmap.add_argument('--template', default='../templates/roadmap_template.md')
    p_roadmap.add_argument('--output', default='../../ROADMAP.md')

    args = parser.parse_args()

    if args.cmd == 'init':
        init_project_tracker(args.target)
    elif args.cmd == 'build':
        build_all(args.json, args.readme, args.template, args.html, args.pdf)
    elif args.cmd == 'validate':
        validate_json(args.json, args.schema)
    elif args.cmd == 'changelog':
        generate_changelog(args.json, args.template, args.output)
    elif args.cmd == 'contributing':
        generate_contributing(args.template, args.output)
    elif args.cmd == 'roadmap':
        generate_roadmap(args.json, args.template, args.output)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
