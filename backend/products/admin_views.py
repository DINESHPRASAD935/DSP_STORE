from datetime import timedelta

from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import UserActivity, Tenant


@method_decorator(ensure_csrf_cookie, name='dispatch')
class AdminCsrfView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # Ensures the CSRF cookie is present for subsequent session-authenticated requests.
        return Response({'csrfToken': get_token(request)})


@method_decorator(csrf_exempt, name='dispatch')
class AdminLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = (request.data.get('username') or '').strip()
        password = request.data.get('password') or ''

        user = authenticate(request, username=username, password=password)
        if not user or not getattr(user, 'is_staff', False):
            return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

        login(request, user)
        return Response(
            {
                'ok': True,
                'user': {
                    'username': user.username,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                },
            },
            status=status.HTTP_200_OK,
        )


class AdminMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({'detail': 'Admin privileges required.'}, status=status.HTTP_403_FORBIDDEN)

        return Response(
            {
                'username': request.user.username,
                'is_staff': request.user.is_staff,
                'is_superuser': request.user.is_superuser,
            }
        )


class AdminLogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.is_staff:
            return Response({'detail': 'Admin privileges required.'}, status=status.HTTP_403_FORBIDDEN)

        logout(request)
        return Response({'ok': True}, status=status.HTTP_200_OK)


class AdminAnalyticsSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({'detail': 'Admin privileges required.'}, status=status.HTTP_403_FORBIDDEN)

        tenant = getattr(request, 'tenant', None)
        if not tenant:
            return Response(
                {
                    'total_viewers': 0,
                    'today_views': 0,
                    'total_views': 0,
                    'unique_viewers_today': 0,
                    'views_last_7_days': 0,
                }
            )

        now = timezone.now()
        today = now.date()
        last_7 = now - timedelta(days=7)

        qs = UserActivity.objects.filter(tenant=tenant, activity_type='view')
        total_views = qs.count()
        today_views = qs.filter(created_at__date=today).count()
        views_last_7_days = qs.filter(created_at__gte=last_7).count()

        unique_viewers_today = qs.filter(
            created_at__date=today,
            ip_address__isnull=False,
        ).values('ip_address').distinct().count()

        return Response(
            {
                'total_viewers': unique_viewers_today,  # kept for UI simplicity
                'today_views': today_views,
                'total_views': total_views,
                'unique_viewers_today': unique_viewers_today,
                'views_last_7_days': views_last_7_days,
            }
        )


class AdminTenantsListView(APIView):
    """
    Admin-only list of tenants.
    Used by the custom `/adminui` frontend.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({'detail': 'Admin privileges required.'}, status=status.HTTP_403_FORBIDDEN)

        qs = Tenant.objects.all().order_by('-created_at')[:500]
        data = [
            {
                'id': t.id,
                'name': t.name,
                'subdomain': t.subdomain,
                'domain': t.domain,
                'is_active': t.is_active,
                'is_default': t.is_default,
                'created_at': t.created_at,
                'updated_at': t.updated_at,
            }
            for t in qs
        ]
        return Response(data)


class AdminUserActivitiesListView(APIView):
    """
    Admin-only list of recorded page views (UserActivity rows).
    Scoped to the current tenant (based on request host).
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({'detail': 'Admin privileges required.'}, status=status.HTTP_403_FORBIDDEN)

        tenant = getattr(request, 'tenant', None)
        if not tenant:
            return Response([])

        limit = request.query_params.get('limit', '200')
        try:
            limit_int = max(1, min(int(limit), 500))
        except (TypeError, ValueError):
            limit_int = 200

        qs = (
            UserActivity.objects.filter(tenant=tenant)
            .select_related('product')
            .order_by('-created_at')[:limit_int]
        )

        data = [
            {
                'id': ua.id,
                'activity_type': ua.activity_type,
                'ip_address': ua.ip_address,
                'user_agent': ua.user_agent,
                'created_at': ua.created_at,
                'product_id': ua.product_id,
                'product_name': ua.product.name if ua.product else None,
            }
            for ua in qs
        ]
        return Response(data)

