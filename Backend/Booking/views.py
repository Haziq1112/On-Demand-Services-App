from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Booking, Feedback 
from services.models import ServiceProvider
from .serializers import BookingSerializer , FeedbackSerializer , ProviderBookingSerializer
from Booking.utils import evaluate_provider_ban
from rest_framework.exceptions import ValidationError

class CreateBookingView(generics.CreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        print("Incoming booking data:", request.data)
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except ValidationError as e:
            print("Validation error:", e.detail)
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            print("Unexpected error in booking create:", str(e))
            traceback.print_exc()
            return Response({'detail': 'Internal Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserBookingsListView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).order_by('-created_at')


import logging
logger = logging.getLogger(__name__)

class SubmitFeedbackView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(id=booking_id, user=request.user)
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found.'}, status=404)

        if booking.status != 'booked':
            return Response({'error': 'Booking already completed or cancelled.'}, status=400)

        if Feedback.objects.filter(booking=booking).exists():
            return Response({'error': 'Feedback already submitted.'}, status=400)

        rating = request.data.get('rating')
        try:
            rating = int(rating)
        except (TypeError, ValueError):
            return Response({'rating': 'Invalid or missing.'}, status=400)

        comment = request.data.get('comment', '')

        if not (1 <= rating <= 5):
            return Response({'rating': 'Must be between 1 and 5.'}, status=400)

        Feedback.objects.create(booking=booking, rating=rating, comment=comment)
        booking.status = 'completed'
        booking.save()

        provider = getattr(booking.service, 'provider', None)
        if provider:
            try:
                evaluate_provider_ban(provider)
            except Exception:
                pass  # Log as needed

        return Response({'message': 'Feedback submitted successfully.'}, status=201)


    
class CancelBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(id=booking_id, user=request.user)
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found.'}, status=404)

        booking.status = 'cancelled'
        booking.save()
        # Optionally: store `reason` separately if needed
        return Response({'message': 'Booking cancelled successfully.'}, status=200)


class ProviderBookingsListView(generics.ListAPIView):
    serializer_class = ProviderBookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Get the service provider object linked to logged-in user
        try:
            provider = self.request.user.serviceprovider
        except ServiceProvider.DoesNotExist:
            return Booking.objects.none()

        # Return bookings where the booking's service belongs to this provider
        return Booking.objects.filter(service__provider=provider).order_by('-created_at')

