from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, BadgeViewSet, SocialMediaViewSet, SiteSettingsViewSet, ContactFormViewSet, BlogPostViewSet
from .admin_views import (
    AdminCsrfView,
    AdminLoginView,
    AdminMeView,
    AdminLogoutView,
    AdminAnalyticsSummaryView,
    AdminTenantsListView,
    AdminUserActivitiesListView,
)
from .views import AnalyticsTrackView

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'badges', BadgeViewSet, basename='badge')
router.register(r'social-media', SocialMediaViewSet, basename='social-media')
router.register(r'site-settings', SiteSettingsViewSet, basename='site-settings')
router.register(r'contact', ContactFormViewSet, basename='contact')
router.register(r'blog-posts', BlogPostViewSet, basename='blog-post')

urlpatterns = [
    path('', include(router.urls)),
    path('admin/csrf/', AdminCsrfView.as_view(), name='admin-csrf'),
    path('admin/login/', AdminLoginView.as_view(), name='admin-login'),
    path('admin/me/', AdminMeView.as_view(), name='admin-me'),
    path('admin/logout/', AdminLogoutView.as_view(), name='admin-logout'),
    path('admin/analytics/summary/', AdminAnalyticsSummaryView.as_view(), name='admin-analytics-summary'),
    path('admin/tenants/', AdminTenantsListView.as_view(), name='admin-tenants-list'),
    path('admin/analytics/activities/', AdminUserActivitiesListView.as_view(), name='admin-user-activities-list'),
    path('analytics/track/', AnalyticsTrackView.as_view(), name='analytics-track'),
]
