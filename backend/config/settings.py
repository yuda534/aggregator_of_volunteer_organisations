"""
Django settings for config project.
"""

from pathlib import Path
import os
import sys
import warnings
from dotenv import load_dotenv
from datetime import timedelta

# ======================================================
# BASE DIR + ENV
# ======================================================

BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent

# Load root .env first (repo-level), then backend/.env to allow overrides.
load_dotenv(PROJECT_ROOT / ".env")
load_dotenv(BASE_DIR / ".env")

# Temporary: drf-yasg uses pkg_resources and emits a global deprecation warning.
warnings.filterwarnings(
    'ignore',
    message='pkg_resources is deprecated as an API.*',
    category=UserWarning,
)

SECRET_KEY = (
    os.getenv("DJANGO_SECRET_KEY")
    or os.getenv("SECRET_KEY")
    or "dev-secret-key-1234567890"
)
DEBUG = os.getenv("DJANGO_DEBUG", "True") == "True"

ALLOWED_HOSTS = [h.strip() for h in os.getenv("ALLOWED_HOSTS", "127.0.0.1,localhost").split(",") if h.strip()]

YANDEX_MAPS_API_KEY = os.getenv("YANDEX_MAPS_API_KEY")


# ======================================================
# APPLICATIONS
# ======================================================

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt',
    'drf_yasg',

    'api',
    'swagger',
]

AUTH_USER_MODEL = 'api.CustomUser'


# ======================================================
# MIDDLEWARE
# ======================================================

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


# ======================================================
# URLS / WSGI
# ======================================================

ROOT_URLCONF = 'config.urls'
WSGI_APPLICATION = 'config.wsgi.application'


TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STORAGES = {
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
}


# ======================================================
# DATABASE
# ======================================================

if os.getenv("USE_SQLITE", "True") == "True" or 'test' in sys.argv:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv("DB_NAME"),
            'USER': os.getenv("DB_USER"),
            'PASSWORD': os.getenv("DB_PASSWORD"),
            'HOST': os.getenv("DB_HOST"),
            'PORT': os.getenv("DB_PORT"),
        }
    }


# ======================================================
# PASSWORD VALIDATION
# ======================================================

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# ======================================================
# INTERNATIONALIZATION
# ======================================================

LANGUAGE_CODE = 'ru'
TIME_ZONE = 'Europe/Moscow'
USE_I18N = True
USE_TZ = True


# ======================================================
# DEFAULTS
# ======================================================

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# ======================================================
# MEDIA FILES
# ======================================================

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# ======================================================
# S3 / MINIO STORAGE
# ======================================================

AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME')
AWS_S3_REGION_NAME = os.getenv('AWS_S3_REGION_NAME', 'us-east-1')
AWS_S3_ENDPOINT_URL = os.getenv('AWS_S3_ENDPOINT_URL')

USE_S3_STORAGE = all(
    [
        AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY,
        AWS_STORAGE_BUCKET_NAME,
        AWS_S3_ENDPOINT_URL,
    ]
)

if USE_S3_STORAGE:
    INSTALLED_APPS.append('storages')
    STORAGES['default'] = {
        'BACKEND': 'storages.backends.s3boto3.S3Boto3Storage',
    }
    AWS_QUERYSTRING_AUTH = True
    AWS_QUERYSTRING_EXPIRE = 3600
    AWS_DEFAULT_ACL = None
    AWS_S3_FILE_OVERWRITE = False
    AWS_S3_ADDRESSING_STYLE = 'path'
    AWS_S3_SIGNATURE_VERSION = 's3v4'
    MEDIA_URL = f\"{AWS_S3_ENDPOINT_URL.rstrip('/')}/{AWS_STORAGE_BUCKET_NAME}/\"


# ======================================================
# DRF + JWT
# ======================================================

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# ======================================================
# CORS / CSRF
# ======================================================

CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CSRF_TRUSTED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

if not DEBUG:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
