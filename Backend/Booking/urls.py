from django.urls import path
from .views import (
    CreateBookingView,
    UserBookingsListView,
    SubmitFeedbackView,
    CancelBookingView,
    ProviderBookingsListView,
)

urlpatterns = [
    path('bookings/', UserBookingsListView.as_view(), name='user-bookings'),
    path('bookings/create/', CreateBookingView.as_view(), name='create-booking'),
    path('bookings/<int:booking_id>/feedback/', SubmitFeedbackView.as_view()),
    path('bookings/<int:booking_id>/cancel/', CancelBookingView.as_view()),
    path('provider/bookings/', ProviderBookingsListView.as_view(), name='provider-bookings'),
]
