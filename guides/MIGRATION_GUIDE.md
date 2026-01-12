# Migration Guide: Single-Tenant to Multitenant

This guide helps you migrate from a single-tenant installation to multitenant architecture.

## ⚠️ Important Notes

- **Backup First**: Always backup your database before running migrations
- **Test Environment**: Test migrations in a development environment first
- **Downtime**: Plan for brief downtime during migration
- **Data Safety**: All existing data will be preserved and assigned to default tenant

## 📋 Pre-Migration Checklist

- [ ] Database backup created
- [ ] Code updated to latest version with Tenant model
- [ ] Development environment tested
- [ ] Migration plan reviewed

## 🔄 Migration Steps

### Step 1: Backup Database

**PostgreSQL:**
```bash
pg_dump -U your_username -d your_database > backup_$(date +%Y%m%d).sql
```

**SQLite:**
```bash
cp db.sqlite3 db.sqlite3.backup
```

### Step 2: Update Code

1. **Pull latest code:**
   ```bash
   git pull origin main
   ```

2. **Install dependencies:**
   ```bash
   cd backend
   source venv/bin/activate
   pip install -r requirements.txt
   ```

### Step 3: Run Migrations

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

### Step 4: Create Default Tenant

**Option A: Via Django Admin**
1. Go to `http://localhost:8000/mrdspadmin`
2. Navigate to Products → Tenants
3. Click "Add Tenant"
4. Fill in:
   - Name: `Default Tenant`
   - Subdomain: `mrdsphub` (or your main subdomain)
   - Domain: `mrdsphub.com` (or your main domain)
   - Check `Is Default`
   - Check `Is Active`
5. Save

**Option B: Via Django Shell**
```bash
python manage.py shell
```

```python
from products.models import Tenant, SiteSettings

# Create default tenant
default_tenant = Tenant.objects.create(
    name="Default Tenant",
    subdomain="mrdsphub",  # Optional: your main subdomain
    domain="mrdsphub.com",  # Optional: your main domain
    is_default=True,
    is_active=True
)

print(f"Created default tenant: {default_tenant.name}")
```

### Step 5: Migrate Existing Data

Run this script to assign all existing data to the default tenant:

```bash
python manage.py shell
```

```python
from products.models import Tenant, Product, Category, Badge, SocialMedia, SiteSettings, UserActivity, ChatMessage

# Get default tenant
try:
    default_tenant = Tenant.objects.get(is_default=True)
except Tenant.DoesNotExist:
    print("ERROR: Default tenant not found. Please create it first.")
    exit(1)

print(f"Using tenant: {default_tenant.name}")

# Migrate Products
products_count = Product.objects.filter(tenant__isnull=True).count()
if products_count > 0:
    Product.objects.filter(tenant__isnull=True).update(tenant=default_tenant)
    print(f"✓ Migrated {products_count} products")

# Migrate Categories
categories_count = Category.objects.filter(tenant__isnull=True).count()
if categories_count > 0:
    Category.objects.filter(tenant__isnull=True).update(tenant=default_tenant)
    print(f"✓ Migrated {categories_count} categories")

# Migrate Badges
badges_count = Badge.objects.filter(tenant__isnull=True).count()
if badges_count > 0:
    Badge.objects.filter(tenant__isnull=True).update(tenant=default_tenant)
    print(f"✓ Migrated {badges_count} badges")

# Migrate Social Media
social_count = SocialMedia.objects.filter(tenant__isnull=True).count()
if social_count > 0:
    SocialMedia.objects.filter(tenant__isnull=True).update(tenant=default_tenant)
    print(f"✓ Migrated {social_count} social media entries")

# Migrate User Activities
activities_count = UserActivity.objects.filter(tenant__isnull=True).count()
if activities_count > 0:
    UserActivity.objects.filter(tenant__isnull=True).update(tenant=default_tenant)
    print(f"✓ Migrated {activities_count} user activities")

# Migrate Chat Messages
chat_count = ChatMessage.objects.filter(tenant__isnull=True).count()
if chat_count > 0:
    ChatMessage.objects.filter(tenant__isnull=True).update(tenant=default_tenant)
    print(f"✓ Migrated {chat_count} chat messages")

# Handle SiteSettings (special case - OneToOne relationship)
old_settings = SiteSettings.objects.filter(tenant__isnull=True).first()
if old_settings:
    # Create new SiteSettings for default tenant
    new_settings = SiteSettings.objects.create(
        tenant=default_tenant,
        brand_name=old_settings.brand_name,
        tagline=old_settings.tagline,
        description=old_settings.description,
        logo_url=old_settings.logo_url,
        footer_logo_url=old_settings.footer_logo_url,
        copyright_text=old_settings.copyright_text,
        developer_credit=old_settings.developer_credit,
        developer_credit_url=old_settings.developer_credit_url,
        contact_email=old_settings.contact_email,
        contact_phone=old_settings.contact_phone,
        operating_hours=old_settings.operating_hours,
        whatsapp_url=old_settings.whatsapp_url,
        page_size=old_settings.page_size,
    )
    # Delete old settings (optional - can keep for reference)
    # old_settings.delete()
    print(f"✓ Migrated SiteSettings to tenant: {default_tenant.name}")

print("\n✅ Migration completed successfully!")
print(f"All data has been assigned to tenant: {default_tenant.name}")
```

### Step 6: Verify Migration

1. **Check Admin Panel:**
   - Go to Django Admin
   - Verify all models show tenant information
   - Check that data is visible

2. **Test API:**
   - Access API endpoints
   - Verify products, categories, etc. are returned
   - Check that SiteSettings loads correctly

3. **Test Frontend:**
   - Access frontend
   - Verify all data displays correctly
   - Test product listing, search, etc.

### Step 7: Update Environment Variables (If Needed)

No changes needed! The multitenant system works automatically.

However, if you want to restrict CORS to specific domains:

```env
CORS_ALLOWED_ORIGINS=https://mrdsphub.com,https://www.mrdsphub.com,https://*.mrdsphub.com
```

## ✅ Post-Migration Checklist

- [ ] All existing data visible in admin panel
- [ ] API endpoints returning correct data
- [ ] Frontend displaying correctly
- [ ] SiteSettings configured for default tenant
- [ ] No errors in logs
- [ ] Can create new tenants successfully

## 🆕 Adding New Tenants

After migration, you can add new tenants:

1. **Via Admin Panel:**
   - Go to Products → Tenants
   - Click "Add Tenant"
   - Fill in tenant details
   - Create SiteSettings for new tenant

2. **Via Django Shell:**
   ```python
   from products.models import Tenant, SiteSettings
   
   new_tenant = Tenant.objects.create(
       name="Client ABC",
       subdomain="clientabc",
       is_active=True
   )
   
   SiteSettings.objects.create(tenant=new_tenant)
   ```

## 🐛 Troubleshooting

### Issue: "No tenant found" errors

**Solution:** Ensure default tenant exists and is marked as `is_default=True`

### Issue: Data not showing

**Solution:** Verify data was migrated and assigned to tenant:
```python
from products.models import Tenant, Product
tenant = Tenant.objects.get(is_default=True)
print(f"Products for {tenant.name}: {Product.objects.filter(tenant=tenant).count()}")
```

### Issue: SiteSettings not loading

**Solution:** Ensure SiteSettings exists for tenant:
```python
from products.models import Tenant, SiteSettings
tenant = Tenant.objects.get(is_default=True)
settings = SiteSettings.load(tenant=tenant)
print(f"Settings: {settings.brand_name}")
```

## 📚 Next Steps

- Review [MULTITENANT_GUIDE.md](./MULTITENANT_GUIDE.md) for detailed multitenant setup
- Configure DNS for subdomain routing (if needed)
- Add SSL certificates for new domains/subdomains
- Test multitenant functionality

## 🔄 Rolling Back

If you need to rollback:

1. **Restore database backup:**
   ```bash
   # PostgreSQL
   psql -U your_username -d your_database < backup_YYYYMMDD.sql
   
   # SQLite
   cp db.sqlite3.backup db.sqlite3
   ```

2. **Revert code:**
   ```bash
   git checkout <previous-commit>
   ```

3. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

---

**Note:** This migration is one-way. Once migrated, you cannot easily rollback without restoring from backup.
