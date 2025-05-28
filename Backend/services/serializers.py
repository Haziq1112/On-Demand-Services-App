from rest_framework import serializers
from .models import ServiceProvider, Service

class ServiceProviderSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceProvider
        fields = '__all__'
        read_only_fields = ['user', 'is_verified_provider']

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'
        read_only_fields = ['provider']
