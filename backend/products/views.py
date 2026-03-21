from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from django_ratelimit.core import is_ratelimited
from .models import Category, Product, Badge, SocialMedia, SiteSettings, ProductSocialMediaLink
from .serializers import CategorySerializer, ProductSerializer, ProductListSerializer, SocialMediaSerializer, SiteSettingsSerializer, ProductSocialMediaLinkSerializer, ContactFormSerializer
from .pagination import DynamicPageNumberPagination
from .utils import build_product_query_params
from django.core.mail import send_mail
from django.conf import settings as django_settings
from .email_utils import send_email_with_config


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing categories.
    Public read-only access.
    Categories are not paginated - return all categories.
    Automatically filtered by tenant.
    """
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]  # Public read access
    pagination_class = None  # Disable pagination for categories
    
    def get_queryset(self):
        """Filter categories by current tenant"""
        tenant = getattr(self.request, 'tenant', None)
        if tenant:
            return Category.objects.filter(tenant=tenant)
        return Category.objects.none()


class BadgeViewSet(viewsets.ViewSet):
    """
    ViewSet for viewing badges.
    Public read-only access.
    Automatically filtered by tenant.
    """
    permission_classes = [AllowAny]  # Public read access
    
    def list(self, request):
        """Return list of active badges for current tenant"""
        tenant = getattr(request, 'tenant', None)
        if tenant:
            badges = Badge.objects.filter(tenant=tenant, is_active=True)
        else:
            badges = Badge.objects.none()
        data = [{'id': b.id, 'name': b.name, 'display_name': b.display_name} for b in badges]
        return Response(data)


class SocialMediaViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing social media profiles.
    Public read-only access.
    Returns only active social media profiles, ordered by order field.
    Automatically filtered by tenant.
    """
    serializer_class = SocialMediaSerializer
    permission_classes = [AllowAny]  # Public read access
    pagination_class = None  # Disable pagination for social media
    
    def get_queryset(self):
        """Filter social media by current tenant"""
        tenant = getattr(self.request, 'tenant', None)
        if tenant:
            return SocialMedia.objects.filter(tenant=tenant, is_active=True).order_by('order', 'name')
        return SocialMedia.objects.none()


class SiteSettingsViewSet(viewsets.ViewSet):
    """
    ViewSet for viewing and updating site settings.
    Public read access, authenticated write access.
    Returns site settings for current tenant.
    """
    permission_classes = [AllowAny]  # Public read access
    
    def list(self, request):
        """Return site settings for current tenant"""
        tenant = getattr(request, 'tenant', None)
        settings = SiteSettings.load(tenant=tenant)
        serializer = SiteSettingsSerializer(settings)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put', 'patch'])
    def update_settings(self, request):
        """Update site settings for current tenant"""
        # Check authentication for write operations
        import os
        require_auth_env = os.environ.get('REQUIRE_AUTH_FOR_WRITES', '').strip().lower()
        debug_mode = os.environ.get('DEBUG', 'True').lower() == 'true'
        require_auth = require_auth_env == 'true' if require_auth_env else not debug_mode
        
        if require_auth and not request.user.is_authenticated:
            return Response(
                {'detail': 'Authentication required to update settings.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        tenant = getattr(request, 'tenant', None)
        settings = SiteSettings.load(tenant=tenant)
        serializer = SiteSettingsSerializer(settings, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ContactFormViewSet(viewsets.ViewSet):
    """
    ViewSet for handling contact form submissions.
    Sends email to site admin when form is submitted.
    """
    permission_classes = [AllowAny]  # Public access
    
    def create(self, request):
        """Handle contact form submission and send email"""
        serializer = ContactFormSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        validated_data = serializer.validated_data
        tenant = getattr(request, 'tenant', None)
        site_settings = SiteSettings.load(tenant=tenant)
        recipient_email = site_settings.contact_email
        
        # Prepare email content
        subject = f"Contact Form: {validated_data['subject']}"
        message = f"""
New contact form submission from {validated_data['name']}

Email: {validated_data['email']}
Subject: {validated_data['subject']}

Message:
{validated_data['message']}

---
This message was sent from the contact form on {request.build_absolute_uri('/')}
        """.strip()
        
        try:
            # Get from email from SiteSettings (DB-first) with safe fallback.
            from_email = (
                site_settings.email_from_address
                or site_settings.contact_email
                or 'noreply@mrdsphub.com'
            )
            
            # Send email to site admin using SiteSettings configuration
            send_email_with_config(
                site_settings=site_settings,
                subject=subject,
                message=message,
                recipient_list=[recipient_email],
                from_email=from_email,
                fail_silently=False,
            )
            
            # Optionally send auto-reply to user
            if validated_data['email']:
                try:
                    send_email_with_config(
                        site_settings=site_settings,
                        subject=f"Thank you for contacting {site_settings.brand_name or 'us'}",
                        message=f"""
Dear {validated_data['name']},

Thank you for reaching out to us. We have received your message and will get back to you soon.

Your message:
{validated_data['message']}

Best regards,
{site_settings.brand_name or 'Mr DSP Hub'} Team
                        """.strip(),
                        recipient_list=[validated_data['email']],
                        from_email=from_email,
                        fail_silently=True,  # Don't fail if auto-reply fails
                    )
                except Exception:
                    pass  # Auto-reply is optional, don't fail the main email
            
            return Response(
                {'message': 'Your message has been sent successfully. We will get back to you soon!'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            # Log the error but don't expose internal details to user
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send contact form email: {str(e)}")
            
            return Response(
                {'error': 'Failed to send message. Please try again later or contact us directly.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing products.
    Public read access, authenticated write access (for production).
    Rate limiting applied to prevent abuse.
    Uses dynamic pagination based on SiteSettings.page_size.
    """
    queryset = Product.objects.filter(is_active=True, is_archived=False)
    serializer_class = ProductSerializer
    pagination_class = DynamicPageNumberPagination
    filter_backends = [DjangoFilterBackend, OrderingFilter]  # Removed SearchFilter - using custom priority-based search
    filterset_fields = ['badge', 'is_archived']
    ordering_fields = ['created_at', 'rating', 'name']
    ordering = ['-created_at']
    
    def dispatch(self, request, *args, **kwargs):
        import os
        debug_mode = os.environ.get('DEBUG', 'True').lower() == 'true'
        
        if not debug_mode and request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            if request.user.is_authenticated and request.user.is_superuser:
                pass
            else:
                if is_ratelimited(request, group='product-writes', key='ip', rate='10/m', increment=True):
                    return Response(
                        {'detail': 'Too many requests. Please try again later.'},
                        status=status.HTTP_429_TOO_MANY_REQUESTS
                    )
        return super().dispatch(request, *args, **kwargs)
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'archived']:
            permission_classes = [AllowAny]
        else:
            import os
            require_auth_env = os.environ.get('REQUIRE_AUTH_FOR_WRITES', '').strip().lower()
            if require_auth_env:
                require_auth = require_auth_env == 'true'
            else:
                debug_mode = os.environ.get('DEBUG', 'True').lower() == 'true'
                require_auth = not debug_mode
            
            if require_auth:
                permission_classes = [IsAuthenticated]
            else:
                permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductSerializer

    def get_queryset(self):
        from django.db.models import Q, Case, When, IntegerField
        
        # Filter by tenant first
        tenant = getattr(self.request, 'tenant', None)
        if tenant:
            queryset = Product.objects.filter(tenant=tenant)
        else:
            queryset = Product.objects.none()
        
        if self.action in ['list', 'retrieve']:
            queryset = queryset.filter(is_active=True, is_archived=False)
        # For admin actions, still filter by tenant but show all products
        
        category = self.request.query_params.get('category', None)
        if category and category != 'All':
            try:
                category_id = int(category)
                queryset = queryset.filter(category_id=category_id)
            except (ValueError, TypeError):
                queryset = queryset.filter(category__name=category)
        
        exclude_id = self.request.query_params.get('exclude_id', None)
        if exclude_id:
            queryset = queryset.exclude(id=exclude_id)
        
        # Priority-based search: name > tagline > description
        search_query = self.request.query_params.get('search', '').strip()
        if search_query:
            # Create priority annotation: 1=name match, 2=tagline match, 3=description match
            queryset = queryset.annotate(
                search_priority=Case(
                    When(name__icontains=search_query, then=1),
                    When(tagline__icontains=search_query, then=2),
                    When(description__icontains=search_query, then=3),
                    default=999,
                    output_field=IntegerField()
                )
            ).filter(
                Q(name__icontains=search_query) |
                Q(tagline__icontains=search_query) |
                Q(description__icontains=search_query)
            ).order_by('search_priority', '-created_at')
        else:
            # No search query, use default ordering
            queryset = queryset.order_by('-created_at')
        
        return queryset

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        """Archive a product"""
        product = self.get_object()
        product.is_archived = True
        product.save()
        return Response({'status': 'product archived'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def unarchive(self, request, pk=None):
        """Unarchive a product"""
        product = self.get_object()
        product.is_archived = False
        product.save()
        return Response({'status': 'product unarchived'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def archived(self, request):
        """Get all archived products for current tenant"""
        tenant = getattr(request, 'tenant', None)
        if tenant:
            archived_products = Product.objects.filter(tenant=tenant, is_archived=True)
        else:
            archived_products = Product.objects.none()
        serializer = self.get_serializer(archived_products, many=True)
        return Response(serializer.data)
