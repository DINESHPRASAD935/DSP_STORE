import os

from django.core.management.base import BaseCommand

from products.models import SiteSettings


class Command(BaseCommand):
    help = (
        "Seed default tenant SiteSettings from environment variables for non-secret defaults. "
        "This helps you move configurable values off .env while keeping true secrets in env."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            help="Overwrite email fields even if SiteSettings already looks configured.",
        )

    def handle(self, *args, **options):
        force = bool(options.get("force"))

        # SiteSettings.load() creates a default tenant and its SiteSettings row if missing.
        settings = SiteSettings.load(tenant=None)

        updated = []

        # Optional: seed page_size if you keep PAGE_SIZE in backend/.env.
        env_page_size = os.environ.get("PAGE_SIZE")
        if env_page_size and str(settings.page_size) == "30":
            try:
                page_size_int = int(env_page_size)
                if 1 <= page_size_int <= 100:
                    settings.page_size = page_size_int
                    updated.append("page_size")
            except ValueError:
                pass

        # Seed non-secret SMTP settings only when DB fields are blank (or when --force is used).
        # Note: TLS/SSL are booleans with model defaults (not-null), so we seed them only when SMTP host/port/backend
        # is completely unconfigured (i.e. "SMTP not configured yet").
        smtp_backend_blank = not settings.email_backend
        smtp_host_blank = not settings.email_host
        smtp_port_blank = not settings.email_port
        smtp_fully_unconfigured = smtp_backend_blank and smtp_host_blank and smtp_port_blank

        env_email_backend = os.environ.get("EMAIL_BACKEND")
        env_email_host = os.environ.get("EMAIL_HOST")
        env_email_port = os.environ.get("EMAIL_PORT")
        env_email_use_tls = os.environ.get("EMAIL_USE_TLS")
        env_email_use_ssl = os.environ.get("EMAIL_USE_SSL")

        if force or smtp_backend_blank:
            if env_email_backend:
                settings.email_backend = env_email_backend
                updated.append("email_backend")

        if force or smtp_host_blank:
            if env_email_host:
                settings.email_host = env_email_host
                updated.append("email_host")

        if force or smtp_port_blank:
            if env_email_port:
                try:
                    settings.email_port = int(env_email_port)
                    updated.append("email_port")
                except ValueError:
                    pass

        if force or smtp_fully_unconfigured:
            # TLS/SSL are booleans in the model with defaults, so only overwrite when env is explicitly set.
            if env_email_use_tls is not None:
                settings.email_use_tls = env_email_use_tls.lower() == "true"
                updated.append("email_use_tls")

            if env_email_use_ssl is not None:
                settings.email_use_ssl = env_email_use_ssl.lower() == "true"
                updated.append("email_use_ssl")

        # Default "from" address is non-secret and can be stored in DB.
        # It's optional; if missing, email_from_address can fall back to contact_email / safe defaults.
        env_default_from = os.environ.get("DEFAULT_FROM_EMAIL")
        if (force or env_default_from) and (force or not settings.email_from_address):
            if env_default_from and not settings.email_from_address:
                settings.email_from_address = env_default_from
                updated.append("email_from_address")

        if updated:
            settings.save()

        self.stdout.write(self.style.SUCCESS(f"SiteSettings seeded. Updated: {', '.join(updated) if updated else 'none'}"))

