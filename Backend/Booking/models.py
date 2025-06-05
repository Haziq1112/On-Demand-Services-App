# models.py
from django.db import models
from django.conf import settings
from services.models import Service  # Assuming you have a Service model
from services.models import ServiceProvider

class Booking(models.Model):
    STATUS_CHOICES = [
        ('booked', 'Booked'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='bookings')
    date = models.DateField(null=False, blank=False)
    time = models.TimeField(null=False, blank=False)
    name = models.CharField(max_length=255)
    contact = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=512)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='booked')  # ✅ Added field
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking by {self.name} for {self.service.name} on {self.date} at {self.time}"
    



class Feedback(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE)
    rating = models.IntegerField()  # 1-5
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class ProviderBan(models.Model):
    provider = models.OneToOneField(ServiceProvider, on_delete=models.CASCADE)
    banned_until = models.DateTimeField()
    permanent = models.BooleanField(default=False)