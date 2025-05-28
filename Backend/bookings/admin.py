from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('service', 'buyer_name', 'contact', 'status', 'created_at')
    search_fields = ('buyer_name', 'contact', 'location')
