from django.conf import settings
from django.db import models

class ServiceProvider(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    is_verified_provider = models.BooleanField(default=False)
    phone = models.CharField(max_length=15)
    profile_image = models.ImageField(upload_to='provider_profiles/', blank=True, null=True)
    address = models.TextField()
    experience = models.TextField()

    def __str__(self):
        return self.user.username

class Service(models.Model):
    provider = models.ForeignKey(ServiceProvider, on_delete=models.CASCADE)
    service_name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)  # No default needed here

    def __str__(self):
        return self.service_name
