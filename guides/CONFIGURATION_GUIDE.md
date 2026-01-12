# Configuration Guide

Complete guide to configuring MrDSP Hub - understanding `.env` vs Site Settings.

## 📋 Configuration Strategy

This application uses a **two-tier configuration system**:

1. **`.env` file** - System-level, security-critical settings
2. **Django Admin → Site Settings** - Tenant-specific, user-configurable settings

## 🔐 System-Level Configuration (.env)

### Location
`backend/.env` (create this file)

### Required Settings

```env
# ============================================
# REQUIRED: Security & System
# ============================================

# Django Secret Key (REQUIRED in production)
DJANGO_SECRET_KEY=your-secret-key-here
# Generate: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Debug Mode
DEBUG=True  # False in production

# Allowed Hosts (comma-separated)
ALLOWED_HOSTS=localhost,127.0.0.1,api.mrdsphub.com
```

### Database Configuration

```env
# Development - SQLite (default, no config needed)
# Production - PostgreSQL
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

### Email Credentials (Required for Email)

```env
# ============================================
# Email Credentials (REQUIRED for email)
# These MUST be in .env for security
# ============================================
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password  # Gmail App Password, not regular password
```

**Why credentials in .env?**
- Security: Credentials should never be in database or admin panel
- Centralized: One set of credentials for all tenants
- Compliance: Better security practices

### Optional Email Server Settings

```env
# Optional: Email server defaults
# Can be overridden per-tenant in Site Settings
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
DEFAULT_FROM_EMAIL=noreply@mrdsphub.com
```

### CORS Configuration

```env
# CORS Allowed Origins (comma-separated)
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://mrdsphub.com
```

### Cache (Production)

```env
# Redis URL (optional, for production)
REDIS_URL=redis://127.0.0.1:6379/1
```

### Security (Production)

```env
# Require authentication for API writes
REQUIRE_AUTH_FOR_WRITES=false  # true in production
```

## 🎛️ Tenant-Specific Configuration (Site Settings)

### Access
Django Admin → Products → Site Settings

### What Can Be Configured

#### 1. Branding
- Brand Name
- Tagline
- Description
- Logo URL (header)
- Footer Logo URL
- Copyright Text
- Developer Credit

#### 2. Contact Information
- Contact Email (displayed on site)
- Contact Phone
- Operating Hours
- WhatsApp URL

#### 3. Email Configuration (Optional)
- **Email From Address** - Overrides `DEFAULT_FROM_EMAIL` from .env
- **Email Backend** - Overrides `EMAIL_BACKEND` from .env
- **Email Host** - Overrides `EMAIL_HOST` from .env
- **Email Port** - Overrides `EMAIL_PORT` from .env
- **Email Use TLS** - Overrides `EMAIL_USE_TLS` from .env
- **Email Use SSL** - Overrides `EMAIL_USE_SSL` from .env

**Note:** Email credentials (`EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`) are always from `.env` for security.

#### 4. Site Configuration
- Page Size (products per page)

#### 5. Content (via other admin sections)
- Products
- Categories
- Badges
- Social Media Profiles

## 🔄 How Configuration Works

### Priority Order

1. **Site Settings** (if set) - Per-tenant configuration
2. **`.env` file** - System-level defaults
3. **Django defaults** - Built-in fallbacks

### Example: Email Configuration

```python
# Priority 1: Site Settings (if set)
site_settings.email_from_address  # e.g., "noreply@client1.com"

# Priority 2: .env file (fallback)
DEFAULT_FROM_EMAIL  # e.g., "noreply@mrdsphub.com"

# Priority 3: Django default
"noreply@mrdsphub.com"
```

### Email Sending Flow

1. Contact form submitted
2. System gets tenant from request (via middleware)
3. Loads Site Settings for tenant
4. Uses email config from Site Settings (if set)
5. Falls back to `.env` if not set
6. Always uses credentials from `.env` (security)

## 📝 Configuration Examples

### Example 1: Single Tenant Setup

**`.env`:**
```env
DJANGO_SECRET_KEY=secret-key
DEBUG=True
ALLOWED_HOSTS=localhost
EMAIL_HOST_USER=admin@mrdsphub.com
EMAIL_HOST_PASSWORD=app-password
```

**Site Settings (Admin):**
- Brand Name: "MrDSP Hub"
- Contact Email: "contact@mrdsphub.com"
- Email From Address: "noreply@mrdsphub.com" (optional)

### Example 2: Multitenant Setup

**`.env` (shared):**
```env
DJANGO_SECRET_KEY=secret-key
DEBUG=False
ALLOWED_HOSTS=api.mrdsphub.com
EMAIL_HOST_USER=shared@mrdsphub.com
EMAIL_HOST_PASSWORD=shared-password
```

**Tenant 1 Site Settings:**
- Brand Name: "Client ABC"
- Contact Email: "contact@clientabc.com"
- Email From Address: "noreply@clientabc.com"
- Email Host: "smtp.clientabc.com" (optional override)

**Tenant 2 Site Settings:**
- Brand Name: "Client XYZ"
- Contact Email: "hello@clientxyz.com"
- Email From Address: "noreply@clientxyz.com"
- (Uses default SMTP from .env)

## ✅ Configuration Checklist

### Initial Setup

- [ ] Create `backend/.env` file
- [ ] Set `DJANGO_SECRET_KEY`
- [ ] Set `DEBUG` (True for dev, False for prod)
- [ ] Set `ALLOWED_HOSTS`
- [ ] Set `DATABASE_URL` (if using PostgreSQL)
- [ ] Set `EMAIL_HOST_USER` and `EMAIL_HOST_PASSWORD`
- [ ] Set `CORS_ALLOWED_ORIGINS`

### Per-Tenant Setup

- [ ] Create tenant in Django Admin
- [ ] Create Site Settings for tenant
- [ ] Configure branding
- [ ] Configure contact information
- [ ] Configure email settings (optional)
- [ ] Set page size

## 🔒 Security Best Practices

1. **Never commit `.env` to git** - Already in `.gitignore`
2. **Keep credentials in `.env`** - Never in Site Settings or database
3. **Use strong `DJANGO_SECRET_KEY`** - Generate unique key for production
4. **Set `DEBUG=False` in production** - Prevents information leakage
5. **Restrict `ALLOWED_HOSTS`** - Only include valid domains
6. **Use App Passwords** - For Gmail, use App Password, not regular password

## 🐛 Troubleshooting

### Email Not Sending

1. **Check `.env` credentials:**
   ```bash
   # Verify EMAIL_HOST_USER and EMAIL_HOST_PASSWORD are set
   ```

2. **Check Site Settings:**
   - Verify email configuration in Site Settings
   - Check "Email From Address" is valid

3. **Test email configuration:**
   ```python
   python manage.py shell
   ```
   ```python
   from products.models import SiteSettings, Tenant
   from products.email_utils import get_email_config
   
   tenant = Tenant.objects.get(is_default=True)
   settings = SiteSettings.load(tenant=tenant)
   config = get_email_config(settings)
   print(config)
   ```

### Configuration Not Applied

1. **Check priority order:**
   - Site Settings override .env
   - .env overrides Django defaults

2. **Verify tenant:**
   - Ensure correct tenant is selected
   - Check tenant is active

3. **Restart server:**
   - .env changes require server restart
   - Site Settings changes are immediate

## 📚 Related Documentation

- [PROJECT_GUIDE.md](./PROJECT_GUIDE.md) - Complete project setup
- [MULTITENANT_GUIDE.md](./MULTITENANT_GUIDE.md) - Multitenant configuration
- [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md) - Production deployment
