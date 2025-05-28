from django.db import models
from services.models import Service

class Booking(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    buyer_name = models.CharField(max_length=100)
    contact = models.CharField(max_length=20)
    location = models.CharField(max_length=255)  # Address text
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    details = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, default='Pending')

    def __str__(self):
        return f"Booking for {self.service.title} by {self.buyer_name}"
