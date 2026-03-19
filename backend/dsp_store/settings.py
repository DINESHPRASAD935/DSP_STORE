"""
Django settings for dsp_store project.
"""

from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

# ===============================
# ENVIRONMENT
# ===============================
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


# ===============================
# CORE SETTINGS
# ===============================
DEBUG = os.environ.get("DEBUG", "False").lower() == "true"

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY")
if not SECRET_KEY:
    # Allow local dev to boot without a secret, but fail in production.
    if DEBUG:
        from django.core.management.utils import get_random_secret_key
        SECRET_KEY = get_random_secret_key()
    else:
        from django.core.exceptions import ImproperlyConfigured
        raise ImproperlyConfigured("DJANGO_SECRET_KEY must be set when DEBUG=False")

ALLOWED_HOSTS = os.environ.get(
    "ALLOWED_HOSTS",
    "mrdsphub.in,www.mrdsphub.in,api.mrdsphub.in,127.0.0.1"
).split(",")


# ===============================
# APPLICATIONS
# ===============================
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "rest_framework",
    "corsheaders",
    "django_filters",
    "django_ratelimit",

    "products",
]


# ===============================
# MIDDLEWARE (ORDER IS IMPORTANT)
# ===============================
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",

    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",
    "products.middleware.TenantMiddleware",

    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# ===============================
# URLS / WSGI
# ===============================
ROOT_URLCONF = "dsp_store.urls"

WSGI_APPLICATION = "dsp_store.wsgi.application"


# ===============================
# TEMPLATES (required for admin)
# ===============================
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


# ===============================
# DATABASE
# ===============================
DATABASE_URL = os.environ.get("DATABASE_URL")

if DATABASE_URL:
    import dj_database_url
    DATABASES = {
        "default": dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }


# ===============================
# CACHING (django_ratelimit requires Redis/Memcached for atomic increment)
# ===============================
# Local dev: start Redis with `redis-server` or `docker run -d -p 6379:6379 redis`
REDIS_URL = os.environ.get("REDIS_URL", "redis://127.0.0.1:6379/1")
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": REDIS_URL,
    }
}


# ===============================
# PASSWORD VALIDATION
# ===============================
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


# ===============================
# INTERNATIONALIZATION
# ===============================
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True


# ===============================
# STATIC & MEDIA
# ===============================
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# ===============================
# DJANGO REST FRAMEWORK
# ===============================
REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 3,
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
}


# ===============================
# CORS CONFIG (FIXED)
# ===============================
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = False

CORS_ALLOWED_ORIGINS = [
    "https://mrdsphub.in",
    "https://www.mrdsphub.in",
    "https://api.mrdsphub.in",
    "https://mrdsphub-frontend.s3-website.ap-south-2.amazonaws.com",
]

# Allow local dev origins (and allow override via backend/.env).
# Without this, browser requests from `http://localhost:5173` get blocked by CORS
# and Axios surfaces it as a generic "Network error".
env_cors_origins = os.environ.get("CORS_ALLOWED_ORIGINS", "").strip()
if env_cors_origins:
    CORS_ALLOWED_ORIGINS = [o.strip() for o in env_cors_origins.split(",") if o.strip()]
elif DEBUG:
    CORS_ALLOWED_ORIGINS = CORS_ALLOWED_ORIGINS + [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
    ]

CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]


# ===============================
# CSRF (VERY IMPORTANT FOR PROD)
# ===============================
CSRF_TRUSTED_ORIGINS = [
    "https://mrdsphub.in",
    "https://www.mrdsphub.in",
    "https://api.mrdsphub.in",
    "https://mrdsphub-frontend.s3-website.ap-south-2.amazonaws.com",
]

# Allow local dev for unsafe HTTP methods (POST/PUT/PATCH) when using cookies/sessions.
if DEBUG:
    CSRF_TRUSTED_ORIGINS = CSRF_TRUSTED_ORIGINS + [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
    ]


# ===============================
# SECURITY (PRODUCTION)
# ===============================
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_SSL_REDIRECT = True

    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = "DENY"


# ===============================
# EMAIL
# ===============================
EMAIL_BACKEND = os.environ.get(
    "EMAIL_BACKEND",
    "django.core.mail.backends.smtp.EmailBackend",
)
EMAIL_HOST = os.environ.get("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.environ.get("EMAIL_PORT", "587"))
EMAIL_USE_TLS = os.environ.get("EMAIL_USE_TLS", "True").lower() == "true"
EMAIL_USE_SSL = os.environ.get("EMAIL_USE_SSL", "False").lower() == "true"
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "")
# Optional; email sending in this project prefers SiteSettings.email_from_address and
# falls back to a safe constant if DEFAULT_FROM_EMAIL is not provided.
DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", "noreply@mrdsphub.com")


# ===============================
# LOGGING
# ===============================
if not DEBUG:
    (BASE_DIR / "logs").mkdir(exist_ok=True)
    LOGGING = {
        "version": 1,
        "disable_existing_loggers": False,
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
            },
            "file": {
                "class": "logging.FileHandler",
                "filename": BASE_DIR / "logs/django.log",
            },
        },
        "root": {
            "handlers": ["console", "file"],
            "level": "INFO",
        },
    }
