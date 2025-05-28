from django.db import models
from services.models import Service
from django.utils import timezone
from datetime import timedelta

class Feedback(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='feedbacks')
    rating = models.PositiveSmallIntegerField()  # 1 to 5 stars
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Rating: {self.rating} for {self.service.title}"

# Extend Service model to track suspension status
from django.db.models.signals import post_save
from django.dispatch import receiver

class ProviderStatus(models.Model):
    service = models.OneToOneField(Service, on_delete=models.CASCADE, related_name='status')
    suspended_until = models.DateTimeField(null=True, blank=True)
    warning_issued = models.BooleanField(default=False)
    permanently_suspended = models.BooleanField(default=False)

    def is_suspended(self):
        if self.permanently_suspended:
            return True
        if self.suspended_until and timezone.now() < self.suspended_until:
            return True
        return False

    def __str__(self):
        status = "Active"
        if self.permanently_suspended:
            status = "Permanently Suspended"
        elif self.suspended_until and timezone.now() < self.suspended_until:
            status = f"Suspended until {self.suspended_until}"
        return f"{self.service.provider_name} status: {status}"

@receiver(post_save, sender=Service)
def create_provider_status(sender, instance, created, **kwargs):
    if created:
        ProviderStatus.objects.create(service=instance)
