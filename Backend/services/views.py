from rest_framework import generics, permissions
from .models import ServiceProvider, Service
from .serializers import ServiceProviderSerializer, ServiceSerializer
from au.authentication import FirebaseAuthentication


class CreateProviderProfileView(generics.CreateAPIView):
    serializer_class = ServiceProviderSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [FirebaseAuthentication]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CreateServiceView(generics.CreateAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [FirebaseAuthentication]
