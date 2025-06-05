from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ServiceProvider, Service, ServiceImage

User = get_user_model()

class ServiceImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceImage
        fields = ['id', 'image']

class ServiceProviderSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    email = serializers.EmailField(source='user.email', required=False)
    password = serializers.CharField(source='user.password', write_only=True, required=False, min_length=8)

    class Meta:
        model = ServiceProvider
        fields = ['full_name', 'email', 'phone', 'bio', 'location', 'profile_picture', 'password', 'id']

    def update(self, instance, validated_data):
        # Update user email and password if provided
        user_data = validated_data.pop('user', {})

        email = user_data.get('email', None)
        password = user_data.get('password', None)

        if email:
            instance.user.email = email
            instance.email = email  # keep in sync
            instance.user.save()

        if password:
            instance.user.set_password(password)
            instance.user.save()

        # Update other ServiceProvider fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

class ServiceSerializer(serializers.ModelSerializer):
    gallery_images = ServiceImageSerializer(many=True, read_only=True)
    gallery = serializers.ListField(write_only=True, required=False)
    thumbnail = serializers.ImageField(required=False, allow_null=True)


    class Meta:
        model = Service
        fields = ['id', 'name', 'description', 'price', 'duration_minutes', 'thumbnail', 'gallery_images', 'gallery']

    def create(self, validated_data):
        gallery_data = validated_data.pop('gallery', [])
        service = Service.objects.create(**validated_data)

        for image_file in gallery_data:
            image_instance = ServiceImage.objects.create(image=image_file)
            service.gallery_images.add(image_instance)

        return service

    def update(self, instance, validated_data):
        gallery_data = validated_data.pop('gallery', [])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if gallery_data:
            instance.gallery_images.all().delete()
            for image_file in gallery_data:
                image_instance = ServiceImage.objects.create(image=image_file)
                instance.gallery_images.add(image_instance)

        return instance
