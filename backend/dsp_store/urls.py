"""
URL configuration for dsp_store project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('mrdspadmin/', admin.site.urls),
    path('api/', include('products.urls')),
]
