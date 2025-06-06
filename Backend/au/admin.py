# admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['username', 'email', 'role', 'firebase_uid', 'is_staff', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
        ('Firebase Info', {'fields': ('firebase_uid', 'role')}),
    )
