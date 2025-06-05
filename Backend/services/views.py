from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound, ValidationError
from .models import ServiceProvider, Service
from .serializers import ServiceProviderSerializer, ServiceSerializer
from rest_framework.generics import DestroyAPIView
from au.authentication import FirebaseAuthentication


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

    def post(self, request, *args, **kwargs):
        # Extract images correctly from FormData
        gallery_images = request.FILES.getlist('gallery')
        data = request.data.copy()
        data.setlist('gallery', gallery_images)

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        provider = ServiceProvider.objects.get(user=self.request.user)
        serializer.save(provider=provider)

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UpdateServiceView(generics.RetrieveUpdateAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [FirebaseAuthentication]

    def get_queryset(self):
        provider = ServiceProvider.objects.get(user=self.request.user)
        return Service.objects.filter(provider=provider)


class RetrieveProviderProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [FirebaseAuthentication]

    def get(self, request):
        try:
            profile = ServiceProvider.objects.get(user=request.user)
            serializer = ServiceProviderSerializer(profile)
            return Response(serializer.data)
        except ServiceProvider.DoesNotExist:
            return Response({}, status=status.HTTP_200_OK)


class ListProviderServicesView(generics.ListAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [FirebaseAuthentication]

    def get_queryset(self):
        provider = ServiceProvider.objects.get(user=self.request.user)
        return Service.objects.filter(provider=provider)

from rest_framework import generics, permissions
from .models import Service, ServiceProvider
from .serializers import ServiceSerializer
from au.authentication import FirebaseAuthentication
from rest_framework.exceptions import NotFound

class RetrieveServiceView(generics.RetrieveAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [FirebaseAuthentication]

    def get_queryset(self):
        provider = ServiceProvider.objects.get(user=self.request.user)
        return Service.objects.filter(provider=provider)

    def get_object(self):
        try:
            service = self.get_queryset().get(pk=self.kwargs['pk'])
            return service
        except Service.DoesNotExist:
            raise NotFound("Service not found.")

class DeleteServiceView(DestroyAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    lookup_field = 'id'