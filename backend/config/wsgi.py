"""
WSGI config for config project.
With production static files check.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

if os.getenv('DJANGO_DEBUG', 'True') != 'True':
    try:
        from pathlib import Path
        BASE_DIR = Path(__file__).resolve().parent.parent
        static_root = BASE_DIR / 'staticfiles'
        admin_css = static_root / 'admin' / 'css' / 'base.css'

        if not admin_css.exists():
            print("\n" + "!"*60)
            print("WARNING: Static files not found!")
            print("Run: python manage.py collectstatic --noinput")
            print("!"*60 + "\n")
    except Exception as e:
        print(f"Static check warning: {e}")

application = get_wsgi_application()