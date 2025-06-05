from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('service', 'user', 'date', 'time', 'name', 'contact', 'created_at')
    list_filter = ('date', 'service')
    search_fields = ('name', 'contact', 'service__name', 'user__username')
    ordering = ('-created_at',)
