# Multitenant Architecture Guide

This application supports **multitenant architecture**, allowing you to host multiple independent sites/instances from a single codebase and database.

## 🏗️ Architecture Overview

### How It Works

- **Tenant Model**: Each tenant represents a separate site/instance
- **Subdomain Routing**: `tenant1.mrdsphub.com` → Tenant 1
- **Domain Routing**: `customdomain.com` → Tenant with custom domain
- **Data Isolation**: All data (products, categories, settings) is automatically filtered by tenant
- **Shared Infrastructure**: Single codebase, single database, shared resources

### Tenant Identification

The system automatically identifies tenants based on:

1. **Custom Domain** (Priority 1): If request comes from `customdomain.com`, matches tenant with that domain
2. **Subdomain** (Priority 2): If request comes from `tenant1.mrdsphub.com`, matches tenant with subdomain `tenant1`
3. **Default Tenant** (Fallback): If no match found, uses the tenant marked as `is_default=True`

## 📋 Setup Instructions

### Step 1: Create Database Migration

After adding the Tenant model, create and run migrations:

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

### Step 2: Create Default Tenant

1. **Via Django Admin:**
   - Go to Django Admin → Tenants
   - Click "Add Tenant"
   - Name: `Default Tenant`
   - Subdomain: `mrdsphub` (or leave blank for main domain)
   - Domain: `mrdsphub.com` (or leave blank)
   - Check `Is Default` and `Is Active`
   - Save

2. **Via Django Shell:**
   ```python
   python manage.py shell
   ```
   ```python
   from products.models import Tenant, SiteSettings
   
   # Create default tenant
   default_tenant = Tenant.objects.create(
       name="Default Tenant",
       subdomain="mrdsphub",  # Optional
       domain="mrdsphub.com",  # Optional
       is_default=True,
       is_active=True
   )
   
   # Create site settings for default tenant
   SiteSettings.objects.create(tenant=default_tenant)
   ```

### Step 3: Migrate Existing Data (If Upgrading)

If you have existing data, you need to assign it to a tenant:

```python
python manage.py shell
```

```python
from products.models import Tenant, Product, Category, Badge, SocialMedia, SiteSettings

# Get default tenant
default_tenant = Tenant.objects.get(is_default=True)

# Migrate existing data
Product.objects.filter(tenant__isnull=True).update(tenant=default_tenant)
Category.objects.filter(tenant__isnull=True).update(tenant=default_tenant)
Badge.objects.filter(tenant__isnull=True).update(tenant=default_tenant)
SocialMedia.objects.filter(tenant__isnull=True).update(tenant=default_tenant)

# Update SiteSettings
old_settings = SiteSettings.objects.filter(tenant__isnull=True).first()
if old_settings:
    old_settings.tenant = default_tenant
    old_settings.save()
```

## 🚀 Adding New Tenants

### Method 1: Via Django Admin

1. Go to Django Admin → Tenants
2. Click "Add Tenant"
3. Fill in:
   - **Name**: Display name (e.g., "Client ABC")
   - **Subdomain**: For subdomain routing (e.g., "clientabc" for `clientabc.mrdsphub.com`)
   - **Domain**: For custom domain (e.g., "clientabc.com")
   - **Is Active**: Check to enable
   - **Is Default**: Only check for one tenant (the main/default one)
4. Save

### Method 2: Via Django Shell

```python
from products.models import Tenant, SiteSettings

# Create new tenant
new_tenant = Tenant.objects.create(
    name="Client ABC",
    subdomain="clientabc",  # For clientabc.mrdsphub.com
    # OR
    domain="clientabc.com",  # For custom domain
    is_active=True
)

# Create site settings for new tenant
SiteSettings.objects.create(tenant=new_tenant)
```

## 🌐 DNS Configuration

### For Subdomain Routing

1. **Route 53 (AWS):**
   - Go to Route 53 → Hosted Zones → `mrdsphub.com`
   - Create A Record:
     - Name: `clientabc` (or `*` for wildcard)
     - Type: A
     - Alias: Yes
     - Alias Target: Your CloudFront distribution or ALB
     - TTL: 300

2. **CloudFront:**
   - Add `*.mrdsphub.com` to Alternate Domain Names (CNAMEs)
   - Update SSL certificate to include `*.mrdsphub.com`

### For Custom Domain Routing

1. **Route 53:**
   - Create new Hosted Zone for `clientabc.com`
   - Create A Record pointing to CloudFront/ALB
   - Update nameservers at domain registrar

2. **CloudFront:**
   - Add `clientabc.com` to Alternate Domain Names
   - Update SSL certificate to include `clientabc.com`

## ⚙️ Configuration

### Environment Variables (.env)

**Required for all tenants:**
- `DJANGO_SECRET_KEY` - Security critical
- `DEBUG` - System-level
- `ALLOWED_HOSTS` - System-level
- `DATABASE_URL` - Database connection
- `EMAIL_HOST_USER` - Email credentials (security)
- `EMAIL_HOST_PASSWORD` - Email credentials (security)

**Optional (can be overridden per-tenant in Site Settings):**
- `EMAIL_BACKEND` - Email backend
- `EMAIL_HOST` - SMTP host
- `EMAIL_PORT` - SMTP port
- `EMAIL_USE_TLS` - Use TLS
- `DEFAULT_FROM_EMAIL` - Default from address

### Per-Tenant Configuration (Site Settings)

Each tenant can configure:
- **Branding**: Name, logo, tagline, description
- **Contact**: Email, phone, WhatsApp
- **Email Settings** (Optional): From address, SMTP settings
  - Falls back to `.env` if not set
  - **Note**: Email credentials must be in `.env` for security
- **Site Config**: Page size, etc.

### Frontend Configuration

The frontend automatically uses the current domain/subdomain. No changes needed!

### Backend Configuration

The `TenantMiddleware` is already added to `settings.py`:

```python
MIDDLEWARE = [
    ...
    'products.middleware.TenantMiddleware',  # Tenant middleware
    ...
]
```

## 🔒 Data Isolation

All models are automatically filtered by tenant:

- ✅ **Products**: Only show products for current tenant
- ✅ **Categories**: Only show categories for current tenant
- ✅ **Badges**: Only show badges for current tenant
- ✅ **Social Media**: Only show social media for current tenant
- ✅ **Site Settings**: Each tenant has its own settings

## 📊 Admin Panel

### Tenant Management

- **Tenants**: Manage all tenants
- **Filtering**: All models show tenant in list view
- **Isolation**: Admins see all tenants, but data is filtered by tenant in API

### Best Practices

1. **One Site Settings Per Tenant**: Each tenant should have exactly one SiteSettings instance
2. **Default Tenant**: Always have one tenant marked as `is_default=True`
3. **Active Tenants**: Only mark tenants as active when ready to serve traffic

## 🧪 Testing Multitenant

### Local Testing

1. **Add to `/etc/hosts` (Linux/Mac):**
   ```
   127.0.0.1 clientabc.localhost
   127.0.0.1 mrdsphub.localhost
   ```

2. **Access:**
   - `http://clientabc.localhost:8000` → Client ABC tenant
   - `http://mrdsphub.localhost:8000` → Default tenant

### Production Testing

1. Create test tenant with subdomain `test`
2. Access `https://test.mrdsphub.com`
3. Verify data isolation

## 🚨 Important Notes

1. **Migration Required**: After adding Tenant model, you MUST run migrations
2. **Data Migration**: Existing data needs to be assigned to a tenant
3. **Default Tenant**: Always create a default tenant for fallback
4. **DNS Propagation**: DNS changes can take 24-48 hours
5. **SSL Certificates**: Update certificates to include all subdomains/domains

## 🔄 Upgrading from Single-Tenant

If you're upgrading an existing single-tenant installation:

1. Run migrations: `python manage.py migrate`
2. Create default tenant (see Step 2 above)
3. Migrate existing data (see Step 3 above)
4. Test that existing site still works
5. Add new tenants as needed

## 📚 Related Documentation

- [PROJECT_GUIDE.md](./PROJECT_GUIDE.md) - General project setup
- [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md) - AWS deployment with multitenant support
