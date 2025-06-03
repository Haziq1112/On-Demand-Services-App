from rest_framework import serializers
from .models import ServiceProvider, Service, ServiceImage

class ServiceImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceImage
        fields = ['id', 'image']


class ServiceProviderSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceProvider
        fields = '__all__'


class ServiceSerializer(serializers.ModelSerializer):
    gallery_images = ServiceImageSerializer(many=True, read_only=True)
    gallery = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )

    class Meta:
        model = Service
        fields = ['id', 'provider', 'name', 'description', 'price', 'duration_minutes', 'thumbnail', 'gallery_images', 'gallery']

    def create(self, validated_data):
        gallery_data = validated_data.pop('gallery', [])
        service = Service.objects.create(**validated_data)

        for image_file in gallery_data:
            image_instance = ServiceImage.objects.create(image=image_file)
            service.gallery_images.add(image_instance)

        return service
