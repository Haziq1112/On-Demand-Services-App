from django.contrib import admin
from .models import Feedback, ProviderStatus

@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('service', 'rating', 'created_at')
    search_fields = ('service__title', 'comment')
    list_filter = ('rating', 'created_at')

@admin.register(ProviderStatus)
class ProviderStatusAdmin(admin.ModelAdmin):
    list_display = ('service', 'suspended_until', 'warning_issued', 'permanently_suspended')
    search_fields = ('service__provider_name',)
    list_filter = ('warning_issued', 'permanently_suspended')
