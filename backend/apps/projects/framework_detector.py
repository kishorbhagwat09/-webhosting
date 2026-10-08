import os
import json

def detect_framework(project_path):
    """
    Analyzes project folder files to automatically detect framework type:
    - 'react' if package.json has react
    - 'node' if package.json exists
    - 'django' if manage.py exists
    - 'flask' if app.py or main.py with flask import exists
    - 'static' default fallback if index.html exists
    """
    if not os.path.exists(project_path):
        return 'static'

    files = os.listdir(project_path)
    
    # Check package.json
    if 'package.json' in files:
        pkg_path = os.path.join(project_path, 'package.json')
        try:
            with open(pkg_path, 'r', encoding='utf-8') as f:
                content = json.load(f)
                deps = {**content.get('dependencies', {}), **content.get('devDependencies', {})}
                if 'react' in deps or 'react-dom' in deps:
                    return 'react'
                return 'node'
        except Exception:
            return 'node'

    # Check Python Django
    if 'manage.py' in files:
        return 'django'

    # Check Python Flask
    for py_file in ['app.py', 'main.py', 'server.py']:
        if py_file in files:
            file_path = os.path.join(project_path, py_file)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    text = f.read()
                    if 'flask' in text.lower():
                        return 'flask'
            except Exception:
                pass
            return 'flask'

    return 'static'
