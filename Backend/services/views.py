from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import ServiceProvider, Service
from .serializers import ServiceProviderSerializer, ServiceSerializer
from django.contrib.auth.models import User

class RegisterServiceProviderView(APIView):
    def post(self, request):
        user = request.user
        if hasattr(user, 'serviceprovider'):
            return Response({"detail": "Already registered as provider."}, status=400)
        serializer = ServiceProviderSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=user, is_verified_provider=True)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class AddServiceView(APIView):
    def post(self, request):
        user = request.user
        try:
            provider = user.serviceprovider
        except ServiceProvider.DoesNotExist:
            return Response({"error": "Not a service provider"}, status=403)

        serializer = ServiceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(provider=provider)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
