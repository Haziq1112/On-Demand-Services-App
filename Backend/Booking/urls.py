from django.urls import path
from .views import (
    CreateBookingView,
    UserBookingsListView,
    SubmitFeedbackView,
    CancelBookingView
)

urlpatterns = [
    path('bookings/', UserBookingsListView.as_view(), name='user-bookings'),
    path('bookings/create/', CreateBookingView.as_view(), name='create-booking'),
    path('bookings/<int:booking_id>/feedback/', SubmitFeedbackView.as_view()),
    path('bookings/<int:booking_id>/cancel/', CancelBookingView.as_view()),
]
