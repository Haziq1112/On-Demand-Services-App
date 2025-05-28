from django.urls import path
from .views import ContactFormAPIView

urlpatterns = [
    path('send/', ContactFormAPIView.as_view(), name='contact-send'),
]
