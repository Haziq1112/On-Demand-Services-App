from django.contrib import admin
from .models import ServiceProvider, Service, ServiceImage

@admin.register(ServiceProvider)
class ServiceProviderAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'phone', 'location')

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'provider', 'price', 'duration_minutes')
    list_filter = ('name',)

@admin.register(ServiceImage)
class ServiceImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'image')
