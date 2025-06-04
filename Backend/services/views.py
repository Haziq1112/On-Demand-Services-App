from rest_framework import generics, permissions
from .models import ServiceProvider, Service
from .serializers import ServiceProviderSerializer, ServiceSerializer
from au.authentication import FirebaseAuthentication
from rest_framework.exceptions import NotFound
from rest_framework.exceptions import ValidationError
class CreateProviderProfileView(generics.CreateAPIView):
    serializer_class = ServiceProviderSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [FirebaseAuthentication]

    def perform_create(self, serializer):
        if ServiceProvider.objects.filter(user=self.request.user).exists():
            raise ValidationError("Profile already exists.")
        serializer.save(user=self.request.user)


class UpdateProviderProfileView(generics.UpdateAPIView):
    serializer_class = ServiceProviderSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [FirebaseAuthentication]

    def get_object(self):
        try:
            return ServiceProvider.objects.get(user=self.request.user)
        except ServiceProvider.DoesNotExist:
            raise NotFound("Service provider profile does not exist.")

class CreateServiceView(generics.CreateAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [FirebaseAuthentication]

    def perform_create(self, serializer):
        provider = ServiceProvider.objects.get(user=self.request.user)
        serializer.save(provider=provider)

class UpdateServiceView(generics.RetrieveUpdateAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [FirebaseAuthentication]

    def get_queryset(self):
        provider = ServiceProvider.objects.get(user=self.request.user)
        return Service.objects.filter(provider=provider)
from rest_framework.response import Response
from rest_framework.views import APIView

class RetrieveProviderProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [FirebaseAuthentication]

    def get(self, request):
        try:
            profile = ServiceProvider.objects.get(user=request.user)
            serializer = ServiceProviderSerializer(profile)
            return Response(serializer.data)
        except ServiceProvider.DoesNotExist:
            return Response({}, status=200)  
