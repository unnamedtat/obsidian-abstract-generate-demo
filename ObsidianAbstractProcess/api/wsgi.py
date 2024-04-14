"""
WSGI config for api project.

It exposes the WSGI callable as a module-level variable named ``app``.

For more information on this file, see
https://docs.djangoproject.com/en/4.1/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application
from api.getToken import get_access_token

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')

app = get_wsgi_application()

# Get API Key and Secret Key from Environment Variables
api_key = os.environ.get('API_KEY')
secret_key = os.environ.get('SECRET_KEY')

# Get Access Token, can use AWS KMS etc. to store the API Key and Secret Key
# for example on static vercel deploy, I only use the environment variables to store the API Key and Secret Key
# But it's not safe, which should be generated regularly [!mark]
access_token = get_access_token(api_key, secret_key)
os.environ['ACCESS_TOKEN'] = access_token