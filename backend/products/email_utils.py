"""
Email configuration utilities.
Gets email settings from SiteSettings with fallback to .env variables.
"""
import os
from django.conf import settings as django_settings


def get_email_config(site_settings=None):
    """
    Get email configuration from SiteSettings with fallback to .env.
    
    Args:
        site_settings: SiteSettings instance (optional)
    
    Returns:
        dict: Email configuration
    """
    config = {}
    
    # Email backend
    if site_settings and site_settings.email_backend:
        config['EMAIL_BACKEND'] = site_settings.email_backend
    else:
        config['EMAIL_BACKEND'] = os.environ.get(
            'EMAIL_BACKEND',
            'django.core.mail.backends.console.EmailBackend'
        )
    
    # Email host
    if site_settings and site_settings.email_host:
        config['EMAIL_HOST'] = site_settings.email_host
    else:
        config['EMAIL_HOST'] = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
    
    # Email port
    if site_settings and site_settings.email_port:
        config['EMAIL_PORT'] = site_settings.email_port
    else:
        config['EMAIL_PORT'] = int(os.environ.get('EMAIL_PORT', '587'))
    
    # Email TLS
    if site_settings and site_settings.email_use_tls is not None:
        config['EMAIL_USE_TLS'] = site_settings.email_use_tls
    else:
        config['EMAIL_USE_TLS'] = os.environ.get('EMAIL_USE_TLS', 'True').lower() == 'true'
    
    # Email SSL
    if site_settings and site_settings.email_use_ssl is not None:
        config['EMAIL_USE_SSL'] = site_settings.email_use_ssl
    else:
        config['EMAIL_USE_SSL'] = os.environ.get('EMAIL_USE_SSL', 'False').lower() == 'true'
    
    # Email credentials (always from .env for security)
    config['EMAIL_HOST_USER'] = os.environ.get('EMAIL_HOST_USER', '')
    config['EMAIL_HOST_PASSWORD'] = os.environ.get('EMAIL_HOST_PASSWORD', '')
    
    # From email address
    if site_settings and site_settings.email_from_address:
        config['DEFAULT_FROM_EMAIL'] = site_settings.email_from_address
    else:
        config['DEFAULT_FROM_EMAIL'] = os.environ.get(
            'DEFAULT_FROM_EMAIL',
            config['EMAIL_HOST_USER'] or 'noreply@mrdsphub.com'
        )
    
    return config


def send_email_with_config(site_settings, subject, message, recipient_list, from_email=None, fail_silently=False):
    """
    Send email using configuration from SiteSettings with .env fallback.
    
    Args:
        site_settings: SiteSettings instance
        subject: Email subject
        message: Email message
        recipient_list: List of recipient email addresses
        from_email: From email address (optional, uses SiteSettings or .env)
        fail_silently: Whether to fail silently
    
    Returns:
        int: Number of emails sent
    """
    from django.core.mail import get_connection
    from django.core.mail.message import EmailMessage
    
    email_config = get_email_config(site_settings)
    
    # Use provided from_email or get from config
    if not from_email:
        from_email = email_config['DEFAULT_FROM_EMAIL']
    
    # Create email connection with config
    connection = get_connection(
        backend=email_config['EMAIL_BACKEND'],
        host=email_config['EMAIL_HOST'],
        port=email_config['EMAIL_PORT'],
        username=email_config['EMAIL_HOST_USER'],
        password=email_config['EMAIL_HOST_PASSWORD'],
        use_tls=email_config['EMAIL_USE_TLS'],
        use_ssl=email_config['EMAIL_USE_SSL'],
        fail_silently=fail_silently,
    )
    
    # Create and send email
    email = EmailMessage(
        subject=subject,
        body=message,
        from_email=from_email,
        to=recipient_list,
        connection=connection,
    )
    
    return email.send()
