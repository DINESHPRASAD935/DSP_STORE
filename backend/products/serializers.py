from rest_framework import serializers
from .models import Category, Product, Badge, SocialMedia, SiteSettings, ProductSocialMediaLink, BlogPost


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'name', 'display_name', 'is_active']


class ProductSocialMediaLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSocialMediaLink
        fields = ['id', 'platform_name', 'url', 'description', 'order']

    def validate_url(self, value):
        """Validate URL format"""
        if value and not (value.startswith('http://') or value.startswith('https://')):
            raise serializers.ValidationError("URL must start with http:// or https://")
        return value


class ProductListSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()
    badge = serializers.SerializerMethodField()
    affiliateLink = serializers.URLField(source='affiliate_link', read_only=True)
    affiliateStoreName = serializers.CharField(
        source='affiliate_store_name',
        allow_blank=True,
        required=False,
        max_length=80,
        read_only=True,
    )
    
    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'tagline',
            'image',
            'category',
            'affiliateLink',
            'affiliateStoreName',
            'badge',
            'rating',
            'created_at',
        ]
    
    def get_category(self, obj):
        if isinstance(obj.category, Category):
            return obj.category.name
        return str(obj.category)
    
    def get_badge(self, obj):
        if obj.badge:
            return obj.badge.display_name or obj.badge.name
        return None


class ProductSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()
    category_id = serializers.IntegerField(write_only=True, required=False)
    badge = serializers.SerializerMethodField()
    badge_id = serializers.IntegerField(write_only=True, required=False)
    social_media_links = ProductSocialMediaLinkSerializer(many=True, read_only=True)
    affiliateLink = serializers.URLField(source='affiliate_link')
    affiliateStoreName = serializers.CharField(
        source='affiliate_store_name',
        allow_blank=True,
        required=False,
        max_length=80,
    )

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'tagline', 'description', 'image',
            'category', 'category_id', 'affiliateLink', 'affiliateStoreName', 'badge', 'badge_id',
            'rating', 'admin_number', 'social_media_links',
            'is_active', 'is_archived', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_category(self, obj):
        if isinstance(obj.category, Category):
            return obj.category.name
        return str(obj.category)
    
    def get_badge(self, obj):
        if obj.badge:
            return obj.badge.display_name or obj.badge.name
        return None
    
    def create(self, validated_data):
        # affiliateLink is already mapped to affiliate_link via source parameter
        category_id = validated_data.pop('category_id', None)
        badge_id = validated_data.pop('badge_id', None)
        
        if category_id:
            validated_data['category_id'] = category_id
        if badge_id:
            validated_data['badge_id'] = badge_id
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # affiliateLink is already mapped to affiliate_link via source parameter
        category_id = validated_data.pop('category_id', None)
        badge_id = validated_data.pop('badge_id', None)
        
        if category_id is not None:
            instance.category_id = category_id
        if badge_id is not None:
            instance.badge_id = badge_id if badge_id else None
        
        return super().update(instance, validated_data)


class SocialMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialMedia
        fields = ['id', 'name', 'icon_url', 'profile_url', 'order', 'is_active']
        read_only_fields = ['created_at']

    def validate_icon_url(self, value):
        """Validate icon URL format"""
        if value and not (value.startswith('http://') or value.startswith('https://')):
            raise serializers.ValidationError("Icon URL must start with http:// or https://")
        return value

    def validate_profile_url(self, value):
        """Validate profile URL format"""
        if value and not (value.startswith('http://') or value.startswith('https://')):
            raise serializers.ValidationError("Invalid profile URL format")
        return value


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = [
            'brand_name', 'tagline', 'description', 'logo_url', 'footer_logo_url',
            'copyright_text', 'developer_credit', 'developer_credit_url',
            'contact_email', 'contact_phone', 'operating_hours', 'whatsapp_url',
            'page_size',
            'email_from_address', 'email_backend', 'email_host', 'email_port',
            'email_use_tls', 'email_use_ssl',
        ]
        read_only_fields = ['updated_at']

    def validate_contact_email(self, value):
        """Validate email format"""
        if not value:
            raise serializers.ValidationError("Contact email is required")
        return value.strip().lower()

    def validate_contact_phone(self, value):
        """Validate phone number"""
        if not value:
            raise serializers.ValidationError("Contact phone is required")
        return value.strip()
    
    def validate_operating_hours(self, value):
        """Validate operating hours"""
        if value:
            return value.strip()
        return value
    
    def validate_page_size(self, value):
        """Validate page size"""
        if value is not None:
            if value < 1 or value > 100:
                raise serializers.ValidationError("Page size must be between 1 and 100")
        return value


class ContactFormSerializer(serializers.Serializer):
    """Serializer for contact form submissions"""
    name = serializers.CharField(max_length=200, required=True)
    email = serializers.EmailField(required=True)
    subject = serializers.CharField(max_length=200, required=True)
    message = serializers.CharField(required=True, min_length=10)

    def validate_email(self, value):
        """Validate email format"""
        if not value or '@' not in value:
            raise serializers.ValidationError("Please provide a valid email address")
        return value.strip().lower()

    def validate_message(self, value):
        """Validate message length"""
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Message must be at least 10 characters long")
        return value.strip()


class BlogPostListSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = ['id', 'title', 'slug', 'excerpt', 'cover_image', 'author_name', 'published_at', 'updated_at', 'category', 'is_active']

    def get_category(self, obj):
        if obj.category:
            return obj.category.name
        return None


class BlogPostSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()
    recommended_products = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            'id',
            'title',
            'slug',
            'excerpt',
            'content',
            'cover_image',
            'author_name',
            'category',
            'recommended_product_numbers',
            'recommended_products',
            'published_at',
            'updated_at',
        ]

    def get_category(self, obj):
        if obj.category:
            return {'id': obj.category.id, 'name': obj.category.name, 'slug': obj.category.slug}
        return None

    def get_recommended_products(self, obj):
        numbers = obj.recommended_product_numbers or []
        if not isinstance(numbers, list):
            return []

        cleaned_numbers: list[int] = []
        for n in numbers:
            try:
                cleaned_numbers.append(int(n))
            except (TypeError, ValueError):
                continue

        if not cleaned_numbers:
            return []

        # Keep the same ordering as the admin-configured list.
        products_qs = Product.objects.filter(
            tenant=obj.tenant,
            is_active=True,
            is_archived=False,
            admin_number__in=cleaned_numbers,
        )
        products_by_number = {
            p.admin_number: p
            for p in products_qs
            if p.admin_number is not None
        }

        ordered_products = [products_by_number.get(n) for n in cleaned_numbers]
        ordered_products = [p for p in ordered_products if p is not None]
        return ProductSerializer(ordered_products, many=True, context=self.context).data
