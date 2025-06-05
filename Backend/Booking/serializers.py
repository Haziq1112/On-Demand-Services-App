# serializers.py
from rest_framework import serializers
from .models import Booking ,Feedback, ProviderBan

class BookingSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)
    provider_name = serializers.CharField(source='service.provider.user.full_name', read_only=True)
    provider_image = serializers.ImageField(source='service.provider.profile_image', read_only=True)

    # Writable fields
    date = serializers.DateField()
    time = serializers.TimeField()

    # Optional read-only aliases for display
    service_date = serializers.DateField(source='date', read_only=True)
    service_time = serializers.TimeField(source='time', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'service', 'service_name', 'provider_name', 'provider_image',
            'date', 'time',              # writable
            'service_date', 'service_time',  # read-only aliases
            'status',
            'name', 'contact', 'description', 'location', 'latitude', 'longitude', 'created_at'
        ]
        read_only_fields = ['status', 'created_at']
    

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ['id', 'booking', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'created_at', 'booking']

class ProviderBanSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderBan
        fields = ['id', 'provider', 'banned_until', 'permanent']
        read_only_fields = ['id', 'provider']