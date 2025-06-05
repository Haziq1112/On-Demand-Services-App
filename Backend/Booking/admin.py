from django.contrib import admin
from .models import Booking , Feedback , ProviderBan

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('service', 'user', 'date', 'time', 'name', 'contact', 'created_at')
    list_filter = ('date', 'service')
    search_fields = ('name', 'contact', 'service__name', 'user__username')
    ordering = ('-created_at',)
@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ['id', 'booking', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['comment', 'booking__service__name', 'booking__provider__user__email']

@admin.register(ProviderBan)
class ProviderBanAdmin(admin.ModelAdmin):
    list_display = ['provider', 'banned_until', 'permanent']
    list_filter = ['permanent']
    search_fields = ['provider__user__email']