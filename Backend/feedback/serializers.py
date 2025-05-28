from rest_framework import serializers
from .models import Feedback, ProviderStatus

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = '__all__'

class ProviderStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderStatus
        fields = '__all__'
