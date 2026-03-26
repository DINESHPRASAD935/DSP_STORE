from django.contrib import admin
from .models import Tenant, Category, Product, UserActivity, ChatMessage, Badge, SocialMedia, SiteSettings, ProductSocialMediaLink, BlogPost


@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ['name', 'subdomain', 'domain', 'is_active', 'is_default', 'created_at']
    list_filter = ['is_active', 'is_default', 'created_at']
    search_fields = ['name', 'subdomain', 'domain']
    list_editable = ['is_active', 'is_default']
    fieldsets = (
        (None, {
            'fields': ('name', 'is_active', 'is_default')
        }),
        ('Routing', {
            'fields': ('subdomain', 'domain'),
            'description': 'Either subdomain (e.g., "mrdsphub" for mrdsphub.mrdsphub.com) OR domain (e.g., "mrdsphub.com"), not both.'
        }),
    )


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ['name', 'display_name', 'tenant', 'is_active', 'created_at']
    list_filter = ['tenant', 'is_active', 'created_at']
    list_editable = ['is_active']
    search_fields = ['name', 'display_name']
    raw_id_fields = ['tenant']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    actions = ['delete_selected']
    actions_on_top = True
    actions_on_bottom = True

    list_display = ['name', 'slug', 'tenant', 'created_at']
    list_filter = ['tenant', 'created_at']
    prepopulated_fields = {'slug': ('name',)}
    raw_id_fields = ['tenant']


class ProductSocialMediaLinkInline(admin.TabularInline):
    model = ProductSocialMediaLink
    extra = 1
    fields = ['platform_name', 'url', 'description', 'order']
    ordering = ['order']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'tenant', 'admin_number', 'is_active', 'is_archived', 'rating', 'created_at']
    list_filter = ['tenant', 'category', 'is_active', 'is_archived', 'badge', 'created_at']
    search_fields = ['name', 'tagline', 'description']
    list_editable = ['is_active', 'is_archived']
    inlines = [ProductSocialMediaLinkInline]
    raw_id_fields = ['tenant', 'category', 'badge']
    fieldsets = (
        (None, {
            'fields': (
                'tenant',
                'name',
                'tagline',
                'description',
                'image',
                'category',
                'affiliate_link',
                'affiliate_store_name',
                'badge',
                'rating',
                'admin_number',
            )
        }),
        ('Status', {
            'fields': ('is_active', 'is_archived'),
            'classes': ('collapse',),
        }),
    )


@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    list_display = ['tenant', 'product', 'activity_type', 'ip_address', 'created_at']
    list_filter = ['tenant', 'activity_type', 'created_at']
    search_fields = ['product__name', 'activity_type', 'ip_address']
    raw_id_fields = ['tenant', 'product']
    readonly_fields = ['created_at']


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['tenant', 'message', 'created_at']
    list_filter = ['tenant', 'created_at']
    search_fields = ['message', 'response']
    raw_id_fields = ['tenant']
    readonly_fields = ['created_at']


@admin.register(SocialMedia)
class SocialMediaAdmin(admin.ModelAdmin):
    list_display = ['name', 'tenant', 'order', 'is_active', 'created_at']
    list_editable = ['order', 'is_active']
    search_fields = ['name']
    list_filter = ['tenant', 'is_active', 'created_at']
    raw_id_fields = ['tenant']
    fields = ['tenant', 'name', 'icon_url', 'profile_url', 'order', 'is_active']


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    def has_delete_permission(self, request, obj=None):
        # Don't allow deletion
        return False
    
    list_display = ['tenant', 'brand_name', 'contact_email', 'contact_phone', 'page_size', 'updated_at']
    list_filter = ['tenant', 'updated_at']
    search_fields = ['brand_name', 'contact_email', 'contact_phone']
    raw_id_fields = ['tenant']
    fieldsets = (
        ('Tenant', {
            'fields': ('tenant',)
        }),
        ('Branding', {
            'fields': ('brand_name', 'tagline', 'description', 'logo_url', 'footer_logo_url')
        }),
        ('Footer & Credits', {
            'fields': ('copyright_text', 'developer_credit', 'developer_credit_url')
        }),
        ('Contact Information', {
            'fields': ('contact_email', 'contact_phone', 'operating_hours', 'whatsapp_url')
        }),
        ('Email Configuration', {
            'fields': (
                'email_from_address',
                'email_backend',
                'email_host',
                'email_port',
                'email_use_tls',
                'email_use_ssl',
            ),
            'description': 'Email settings (optional). Falls back to .env variables if not set. EMAIL_HOST_USER and EMAIL_HOST_PASSWORD must be set in .env file for security.',
            'classes': ('collapse',),
        }),
        ('Site Configuration', {
            'fields': ('page_size',)
        }),
    )
    readonly_fields = ['updated_at']


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'slug', 'tenant', 'category', 'is_active', 'is_archived', 'published_at', 'updated_at']
    list_filter = ['tenant', 'category', 'is_active', 'is_archived', 'updated_at']
    search_fields = ['title', 'slug', 'excerpt', 'content', 'author_name']
    raw_id_fields = ['tenant', 'category']
    fieldsets = (
        (None, {
            'fields': (
                'tenant',
                'title',
                'slug',
                'excerpt',
                'content',
                'cover_image',
                'author_name',
                'category',
                'recommended_product_numbers',
                'cta_label',
                'cta_url',
                'cta_product_serial_number',
                'published_at',
            )
        }),
        ('Status', {
            'fields': ('is_active', 'is_archived')
        }),
    )
    prepopulated_fields = {'slug': ('title',)}
