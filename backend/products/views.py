from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from django_ratelimit.core import is_ratelimited
from .models import Category, Product, Badge, SocialMedia, SiteSettings, ProductSocialMediaLink, BlogPost, UserActivity, Tenant
from .serializers import (
    CategorySerializer,
    BadgeSerializer,
    ProductSerializer,
    ProductListSerializer,
    SocialMediaSerializer,
    SiteSettingsSerializer,
    ProductSocialMediaLinkSerializer,
    ContactFormSerializer,
    BlogPostListSerializer,
    BlogPostSerializer,
)
from .pagination import DynamicPageNumberPagination
from .utils import build_product_query_params
from django.core.mail import send_mail
from django.conf import settings as django_settings
from .email_utils import send_email_with_config
from django.utils import timezone


class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing categories.
    Public read-only access.
    Categories are not paginated - return all categories.
    Automatically filtered by tenant.
    """
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]

    # Disable pagination for categories (handled by DRF if pagination_class=None on viewset)
    pagination_class = None
    
    def get_queryset(self):
        """Filter categories by current tenant"""
        tenant = getattr(self.request, 'tenant', None)
        if tenant:
            return Category.objects.filter(tenant=tenant)
        return Category.objects.none()

    def perform_create(self, serializer):
        tenant = getattr(self.request, 'tenant', None)
        serializer.save(tenant=tenant)


class BadgeViewSet(viewsets.ModelViewSet):
    """
    Badge CRUD:
    - Public read: active badges only
    - Admin read/write: all badges
    """

    serializer_class = BadgeSerializer
    pagination_class = None

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        tenant = getattr(self.request, 'tenant', None)
        if not tenant:
            return Badge.objects.none()

        qs = Badge.objects.filter(tenant=tenant)
        if not (getattr(self.request, 'user', None) and self.request.user.is_staff):
            qs = qs.filter(is_active=True)
        return qs.order_by('name')

    def perform_create(self, serializer):
        tenant = getattr(self.request, 'tenant', None)
        serializer.save(tenant=tenant)


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
        if not request.user.is_authenticated:
            return Response(
                {'detail': 'Authentication required to update settings.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not request.user.is_staff:
            return Response(
                {'detail': 'Admin privileges required to update settings.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        
        tenant = getattr(request, 'tenant', None)
        settings = SiteSettings.load(tenant=tenant)
        serializer = SiteSettingsSerializer(settings, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BlogPostViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public read-only API for blog posts.
    - GET /api/blog-posts/ (list)
    - GET /api/blog-posts/{slug}/ (detail by slug)
    """

    lookup_field = 'slug'
    permission_classes = [AllowAny]
    pagination_class = DynamicPageNumberPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['title', 'excerpt', 'content']
    ordering_fields = ['published_at', 'updated_at', 'title']
    ordering = ['-published_at']

    def get_queryset(self):
        tenant = getattr(self.request, 'tenant', None)
        if not tenant:
            return BlogPost.objects.none()
        return BlogPost.objects.filter(
            tenant=tenant,
            is_active=True,
            is_archived=False,
        )

    def get_serializer_class(self):
        if self.action == 'list':
            return BlogPostListSerializer
        return BlogPostSerializer


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
            permission_classes = [IsAdminUser]
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


class AnalyticsTrackView(APIView):
    """
    Track public page views for the admin analytics dashboard.
    Frontend calls this on route changes.
    """

    permission_classes = [AllowAny]
    # Disable DRF's default SessionAuthentication (which enforces CSRF on POST).
    authentication_classes: list = []

    def post(self, request):
        tenant = getattr(request, 'tenant', None)
        if tenant is None:
            tenant = Tenant.objects.filter(is_default=True, is_active=True).first()
        if tenant is None:
            # Safety fallback for environments where a default tenant doesn't exist yet.
            tenant, _ = Tenant.objects.get_or_create(
                name='Default Tenant',
                defaults={'is_default': True, 'is_active': True},
            )

        ip_raw = request.META.get('HTTP_X_FORWARDED_FOR') or request.META.get('REMOTE_ADDR')
        ip_address = None
        if ip_raw:
            ip_address = str(ip_raw).split(',')[0].strip() or None

        user_agent = request.META.get('HTTP_USER_AGENT', '')[:5000]  # keep DB size sane

        # Cache-based throttle (per IP) to avoid hammering DB.
        # If Redis isn't running in dev, cache ops can fail—never break page loads for analytics.
        if ip_address:
            try:
                throttle_key = f'pv:throttle:{tenant.id}:{ip_address}'
                hits = cache.get(throttle_key, 0)
                if hits and int(hits) >= 60:
                    return Response({'ok': True, 'throttled': True}, status=status.HTTP_200_OK)
                if hits:
                    try:
                        cache.incr(throttle_key)
                    except Exception:
                        cache.set(throttle_key, int(hits) + 1, timeout=60)
                else:
                    cache.set(throttle_key, 1, timeout=60)
            except Exception:
                pass

        # Optional lightweight de-dupe for the same IP in short bursts.
        if ip_address:
            last = (
                UserActivity.objects.filter(tenant=tenant, activity_type='view', ip_address=ip_address)
                .order_by('-created_at')
                .first()
            )
            if last and (timezone.now() - last.created_at).total_seconds() < 5:
                return Response({'ok': True, 'deduped': True}, status=status.HTTP_200_OK)

        UserActivity.objects.create(
            tenant=tenant,
            product=None,
            activity_type='view',
            ip_address=ip_address,
            user_agent=user_agent or None,
        )

        return Response({'ok': True, 'deduped': False}, status=status.HTTP_200_OK)
