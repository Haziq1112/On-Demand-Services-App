# serializers.py
from rest_framework import serializers
from .models import Booking ,Feedback, ProviderBan

class BookingSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)
    provider_name = serializers.CharField(source='service.provider.full_name', read_only=True)
    service_image = serializers.ImageField(source='service.thumbnail', read_only=True) 
    customer_name = serializers.CharField(source='name', read_only=True)
    customer_email = serializers.EmailField(source='customer.email', read_only=True)
    cancellation_reason = serializers.CharField(read_only=True)
    date = serializers.DateField()
    time = serializers.TimeField()

    # Optional read-only aliases for display
    service_date = serializers.DateField(source='date', read_only=True)
    service_time = serializers.TimeField(source='time', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'service', 'service_name', 'provider_name', 'service_image',
            'date', 'time',   'customer_name', 'customer_email', 'cancellation_reason', 
            'service_date', 'service_time',  # read-only aliases
            'status',
            'name', 'contact', 'description', 'location', 'latitude', 'longitude', 'created_at'
        ]
        read_only_fields = ['status', 'created_at']
    

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = [ 'rating', 'comment']
        

class ProviderBanSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderBan
        fields = ['id', 'provider', 'banned_until', 'permanent']
        read_only_fields = ['id', 'provider']

class FeedbackDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ['rating', 'comment', 'created_at']

class ProviderBookingSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)
    service_image = serializers.ImageField(source='service.thumbnail', read_only=True)
    feedback = serializers.SerializerMethodField()
    customer_name = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id', 'service', 'service_name', 'date', 'time',
            'name', 'contact', 'description', 'location', 'status',
            'created_at', 'feedback', 'customer_name', 'service_image'
        ]

    def get_feedback(self, obj):
        try:
            feedback = Feedback.objects.get(booking=obj)
            return FeedbackDetailSerializer(feedback).data
        except Feedback.DoesNotExist:
            return None

    def get_customer_name(self, obj):
        return obj.name  # The booking name field, not obj.customer
