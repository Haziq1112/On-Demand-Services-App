# accounts/urls.py
from django.urls import path
from .views import FirebaseTokenVerifyView

urlpatterns = [
    path('verify-firebase-token/', FirebaseTokenVerifyView.as_view(), name='firebase-token-verify'),
]
