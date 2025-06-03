from django.db import models
from django.contrib.auth import get_user_model

ALLOWED_SERVICES = ['Cleaning', 'Repair', 'Painting', 'Shifting', 'Plumbing', 'Electric']

User = get_user_model()

class ServiceProvider(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    bio = models.TextField(blank=True)
    location = models.CharField(max_length=255)
    profile_picture = models.ImageField(upload_to='provider_profiles/', null=True, blank=True)

    def __str__(self):
        return self.full_name


class Service(models.Model):
    provider = models.ForeignKey(ServiceProvider, on_delete=models.CASCADE, related_name='services')
    name = models.CharField(max_length=50, choices=[(s, s) for s in ALLOWED_SERVICES])
    description = models.TextField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    duration_minutes = models.IntegerField()
    thumbnail = models.ImageField(upload_to='service_thumbnails/')
    gallery_images = models.ManyToManyField('ServiceImage')

    def __str__(self):
        return f"{self.name} by {self.provider.full_name}"


class ServiceImage(models.Model):
    image = models.ImageField(upload_to='service_galleries/')
