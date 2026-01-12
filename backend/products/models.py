from django.db import models
from django.utils.text import slugify
from django.core.exceptions import ValidationError


class Tenant(models.Model):
    """
    Multitenant model - Each tenant represents a separate site/instance.
    Supports both subdomain-based (e.g., tenant1.mrdsphub.com) and domain-based (e.g., tenant1.com) routing.
    """
    name = models.CharField(max_length=100, unique=True, help_text="Tenant name (e.g., 'MrDSP Hub', 'Client Name')")
    subdomain = models.SlugField(
        unique=True,
        blank=True,
        null=True,
        help_text="Subdomain for this tenant (e.g., 'mrdsphub' for mrdsphub.mrdsphub.com). Leave blank for main domain."
    )
    domain = models.CharField(
        max_length=255,
        unique=True,
        blank=True,
        null=True,
        help_text="Custom domain for this tenant (e.g., 'mrdsphub.com'). Leave blank to use subdomain."
    )
    is_active = models.BooleanField(default=True, help_text="Whether this tenant is active")
    is_default = models.BooleanField(
        default=False,
        help_text="Default tenant for requests without subdomain/domain match"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        """Validate that either subdomain or domain is provided"""
        if not self.subdomain and not self.domain:
            raise ValidationError("Either subdomain or domain must be provided.")
        if self.subdomain and self.domain:
            raise ValidationError("Provide either subdomain OR domain, not both.")

    def save(self, *args, **kwargs):
        self.full_clean()
        # Ensure only one default tenant exists
        if self.is_default:
            Tenant.objects.filter(is_default=True).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']
        verbose_name = "Tenant"
        verbose_name_plural = "Tenants"

    @classmethod
    def get_from_request(cls, request):
        """
        Get tenant from request based on subdomain or domain.
        Returns default tenant if no match found.
        """
        host = request.get_host().lower()
        
        # Remove port if present
        if ':' in host:
            host = host.split(':')[0]
        
        # Try to match by domain first
        tenant = cls.objects.filter(domain=host, is_active=True).first()
        if tenant:
            return tenant
        
        # Try to match by subdomain
        if '.' in host:
            subdomain = host.split('.')[0]
            tenant = cls.objects.filter(subdomain=subdomain, is_active=True).first()
            if tenant:
                return tenant
        
        # Return default tenant
        return cls.objects.filter(is_default=True, is_active=True).first()


class Category(models.Model):
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='categories',
        help_text="Tenant this category belongs to"
    )
    name = models.CharField(max_length=100)
    slug = models.SlugField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']
        unique_together = [['tenant', 'name'], ['tenant', 'slug']]


class Badge(models.Model):
    """Model for product badges that can be managed in admin panel"""
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='badges',
        help_text="Tenant this badge belongs to"
    )
    name = models.CharField(max_length=50)
    display_name = models.CharField(max_length=50, help_text="Display name shown on frontend")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.display_name or self.name

    class Meta:
        ordering = ['name']
        unique_together = [['tenant', 'name']]


class Product(models.Model):
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='products',
        help_text="Tenant this product belongs to"
    )
    name = models.CharField(max_length=200)
    tagline = models.CharField(max_length=300)
    description = models.TextField()
    image = models.URLField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    affiliate_link = models.URLField()
    badge = models.ForeignKey(Badge, on_delete=models.SET_NULL, blank=True, null=True, related_name='products')
    rating = models.DecimalField(max_digits=3, decimal_places=1, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-created_at']


class ProductSocialMediaLink(models.Model):
    """Model for product-specific social media links (reels, videos, etc.)"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='social_media_links')
    platform_name = models.CharField(max_length=50, help_text="Platform name (e.g., Instagram, YouTube, Facebook, TikTok)")
    url = models.URLField(help_text="URL to the social media content (reel, video, etc.)")
    description = models.CharField(max_length=200, blank=True, help_text="Short description of the content")
    order = models.IntegerField(default=0, help_text="Display order (lower numbers appear first)")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} - {self.platform_name}"

    class Meta:
        ordering = ['order', 'platform_name']
        unique_together = ['product', 'platform_name', 'url']


# Future models for analytics and chatbot
class UserActivity(models.Model):
    """Model to track user activities for analytics"""
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='user_activities',
        help_text="Tenant this activity belongs to"
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True)
    activity_type = models.CharField(max_length=50)  # 'view', 'click', 'search', etc.
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "User Activities"
        ordering = ['-created_at']


class ChatMessage(models.Model):
    """Model for chatbot messages (future implementation)"""
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='chat_messages',
        help_text="Tenant this chat message belongs to"
    )
    message = models.TextField()
    response = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class SocialMedia(models.Model):
    """Model for social media profiles that can be managed in admin panel"""
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='social_media',
        help_text="Tenant this social media belongs to"
    )
    name = models.CharField(max_length=50, help_text="Platform name (e.g., Instagram, Facebook, YouTube)")
    icon_url = models.URLField(help_text="URL to the icon/image for this social media platform")
    profile_url = models.URLField(help_text="URL to your social media profile")
    order = models.IntegerField(default=0, help_text="Display order (lower numbers appear first)")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Social Media"
        ordering = ['order', 'name']
        unique_together = [['tenant', 'name']]


class SiteSettings(models.Model):
    """Model for site-wide settings managed via admin panel - One per tenant"""
    tenant = models.OneToOneField(
        Tenant,
        on_delete=models.CASCADE,
        related_name='site_settings',
        help_text="Tenant these settings belong to"
    )
    # Branding
    brand_name = models.CharField(
        max_length=100,
        default='MrDSP Hub',
        help_text="Brand/Company name displayed throughout the site"
    )
    tagline = models.CharField(
        max_length=200,
        default='Premium Picks',
        help_text="Brand tagline displayed in headers and footers"
    )
    description = models.TextField(
        default='Your trusted destination for premium product reviews and exclusive deals.',
        help_text="Brand description displayed in footer and about sections"
    )
    logo_url = models.URLField(
        blank=True,
        null=True,
        help_text="URL to header logo image (AWS S3, Cloudinary, Imgur, etc.)"
    )
    footer_logo_url = models.URLField(
        blank=True,
        null=True,
        help_text="URL to footer logo image (optional, falls back to logo_url if not set)"
    )
    copyright_text = models.CharField(
        max_length=200,
        default='All Rights Reserved.',
        help_text="Copyright text displayed in footer (e.g., 'All Rights Reserved.')"
    )
    developer_credit = models.CharField(
        max_length=200,
        blank=True,
        help_text="Developer credit text (e.g., 'Developed By Opulent Multimedia')"
    )
    developer_credit_url = models.URLField(
        blank=True,
        null=True,
        help_text="URL for developer credit link (optional)"
    )
    # Contact Information
    contact_email = models.EmailField(
        default='contact@mrdsphub.com',
        help_text="Contact email address displayed on About page"
    )
    contact_phone = models.CharField(
        max_length=20,
        default='+91 9876543210',
        help_text="Contact phone number displayed on About page"
    )
    operating_hours = models.CharField(
        max_length=50,
        default='07:00 AM - 07:00 PM',
        help_text="Operating hours displayed in header (e.g., '07:00 AM - 07:00 PM')"
    )
    whatsapp_url = models.URLField(
        blank=True,
        null=True,
        help_text="WhatsApp contact URL (e.g., https://wa.me/1234567890 or https://api.whatsapp.com/send?phone=1234567890)"
    )
    # Site Configuration
    page_size = models.IntegerField(
        default=30,
        help_text="Number of products to display per page (used by frontend pagination)"
    )
    # Email Configuration (Optional - falls back to .env if not set)
    email_from_address = models.EmailField(
        blank=True,
        null=True,
        help_text="Email address to send emails from (e.g., noreply@mrdsphub.com). Falls back to .env DEFAULT_FROM_EMAIL if not set."
    )
    email_backend = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text="Email backend (e.g., django.core.mail.backends.smtp.EmailBackend). Falls back to .env EMAIL_BACKEND if not set."
    )
    email_host = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text="SMTP host (e.g., smtp.gmail.com). Falls back to .env EMAIL_HOST if not set."
    )
    email_port = models.IntegerField(
        blank=True,
        null=True,
        help_text="SMTP port (e.g., 587). Falls back to .env EMAIL_PORT if not set."
    )
    email_use_tls = models.BooleanField(
        default=True,
        help_text="Use TLS for email. Falls back to .env EMAIL_USE_TLS if not set."
    )
    email_use_ssl = models.BooleanField(
        default=False,
        help_text="Use SSL for email. Falls back to .env EMAIL_USE_SSL if not set."
    )
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Site Settings - {self.tenant.name}"

    class Meta:
        verbose_name = "Site Settings"
        verbose_name_plural = "Site Settings"

    @classmethod
    def load(cls, tenant=None):
        """Get or create settings for a tenant"""
        if tenant is None:
            # Fallback to default tenant for backward compatibility
            from django.core.exceptions import ObjectDoesNotExist
            try:
                tenant = Tenant.objects.get(is_default=True, is_active=True)
            except (Tenant.DoesNotExist, Tenant.MultipleObjectsReturned):
                # Create default tenant if none exists
                tenant, _ = Tenant.objects.get_or_create(
                    name="Default Tenant",
                    defaults={'is_default': True, 'is_active': True}
                )
        
        obj, created = cls.objects.get_or_create(tenant=tenant)
        return obj
