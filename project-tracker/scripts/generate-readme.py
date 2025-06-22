import json
from pathlib import Path
from datetime import datetime
import sys
import os

try:
    import markdown
except ImportError:
    markdown = None
try:
    import weasyprint
except ImportError:
    weasyprint = None

TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), '..', 'templates', 'readme_template.md')

def render_template(template_str, context):
    for key, value in context.items():
        template_str = template_str.replace(f'{{{{{key}}}}}', str(value))
    return template_str

def build_progress_table(modules):
    lines = []
    for m in modules:
        prog = m.get('progress', '')
        if prog == '':
            prog = {'done': '100%', 'not_started': '0%', 'in_progress': m.get('progress', '?%')}.get(m.get('status',''), '?%')
        elif isinstance(prog, int):
            prog = f"{prog}%"
        lines.append(f"| {m.get('name','')} | {m.get('status','')} | {prog} |")
        for sm in m.get('submodules', []):
            sm_prog = sm.get('progress', '')
            if sm_prog == '':
                sm_prog = {'done': '100%', 'not_started': '0%', 'in_progress': sm.get('progress', '?%')}.get(sm.get('status',''), '?%')
            elif isinstance(sm_prog, int):
                sm_prog = f"{sm_prog}%"
            lines.append(f"|   ↳ {sm.get('name','')} | {sm.get('status','')} | {sm_prog} |")
    return '\n'.join(lines)

def build_modules_details(modules):
    lines = []
    for module in modules:
        lines.append(f"### {module.get('name', '')}\n- **Statut** : {module.get('status', '')}\n- **Détails** : {module.get('details', '')}\n")
        if 'submodules' in module:
            for sm in module['submodules']:
                lines.append(f"  - **{sm.get('name','')}** : {sm.get('status','')} – {sm.get('details','')}\n")
        lines.append('---\n')
    return ''.join(lines)

def build_missing_files(missing_files):
    if not missing_files:
        return "Aucun fichier manquant.\n"
    return ''.join([f"- `{f}`\n" for f in missing_files])

def build_next_steps(steps):
    return '\n'.join([f"{i+1}. {step}" for i, step in enumerate(steps)])

def generate_readme(json_path, readme_path, template_path=None, html_path=None, pdf_path=None):
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    with open(template_path or TEMPLATE_PATH, 'r', encoding='utf-8') as f:
        template = f.read()
    now = datetime.now().strftime("%d/%m/%Y à %H:%M")
    source = Path(json_path).name
    context = {
        'project': data.get('project', ''),
        'description': data.get('description', ''),
        'timestamp': now,
        'source': source,
        'progression': data.get('progression', '?'),
        'progress_table': build_progress_table(data.get('modules', [])),
        'modules_details': build_modules_details(data.get('modules', [])),
        'missing_files': build_missing_files(data.get('missing_files', [])),
        'next_steps': build_next_steps(data.get('next_steps', [])),
    }
    readme_content = render_template(template, context)
    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write(readme_content)
    # Génération HTML
    if html_path:
        html_content = readme_content
        if markdown:
            html_content = markdown.markdown(html_content, extensions=['tables'])
        else:
            html_content = f"<pre>{html_content}</pre>"
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
    # Génération PDF
    if pdf_path and weasyprint:
        if not html_path:
            html_content = readme_content
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
    parser.add_argument('--json', default='../example.project-status.json', help='Chemin du fichier JSON source')
    parser.add_argument('--readme', default='../../README.md', help='Chemin du README à générer')
    parser.add_argument('--template', default=None, help='Chemin du template Markdown')
    parser.add_argument('--html', default=None, help='Chemin du rapport HTML à générer')
    parser.add_argument('--pdf', default=None, help='Chemin du rapport PDF à générer')
    args = parser.parse_args()

    generate_readme(args.json, args.readme, template_path=args.template, html_path=args.html, pdf_path=args.pdf)
    print(f"README, rapport HTML et PDF générés à partir de {args.json}.")
