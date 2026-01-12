"""
Tenant middleware for multitenant support.
Automatically sets the current tenant based on subdomain or domain.
"""
from django.utils.deprecation import MiddlewareMixin
from .models import Tenant


class TenantMiddleware(MiddlewareMixin):
    """
    Middleware to set the current tenant based on request host.
    Sets request.tenant for use throughout the application.
    """
    
    def process_request(self, request):
        """Set tenant on request object"""
        request.tenant = Tenant.get_from_request(request)
        return None
