from rest_framework.pagination import PageNumberPagination
from rest_framework.settings import api_settings
from .models import SiteSettings


class DynamicPageNumberPagination(PageNumberPagination):
    """
    Custom pagination class that reads page_size from SiteSettings.
    Falls back to default PAGE_SIZE from settings if SiteSettings is not available.
    """
    page_size_query_param = 'page_size'
    max_page_size = 100
    
    def get_page_size(self, request):
        # Check if page_size is specified in query params (takes precedence)
        if self.page_size_query_param:
            page_size = request.query_params.get(self.page_size_query_param)
            if page_size is not None:
                try:
                    return int(page_size)
                except (TypeError, ValueError):
                    pass
        
        # Try to get page_size from SiteSettings
        try:
            settings = SiteSettings.load()
            if settings.page_size and settings.page_size > 0:
                return settings.page_size
        except Exception:
            # Fallback to default if SiteSettings is not available
            pass
        
        # Fallback to default PAGE_SIZE from REST_FRAMEWORK settings
        return api_settings.PAGE_SIZE
