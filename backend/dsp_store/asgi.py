"""
ASGI config for dsp_store project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dsp_store.settings')

application = get_asgi_application()
