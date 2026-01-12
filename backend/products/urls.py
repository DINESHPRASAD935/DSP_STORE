from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, BadgeViewSet, SocialMediaViewSet, SiteSettingsViewSet, ContactFormViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'badges', BadgeViewSet, basename='badge')
router.register(r'social-media', SocialMediaViewSet, basename='social-media')
router.register(r'site-settings', SiteSettingsViewSet, basename='site-settings')
router.register(r'contact', ContactFormViewSet, basename='contact')

urlpatterns = [
    path('', include(router.urls)),
]
