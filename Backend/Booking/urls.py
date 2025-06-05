# urls.py
from django.urls import path
from .views import CreateBookingView, UserBookingsListView

urlpatterns = [
    path('bookings/', UserBookingsListView.as_view(), name='user-bookings'),
    path('bookings/create/', CreateBookingView.as_view(), name='create-booking'),
]
