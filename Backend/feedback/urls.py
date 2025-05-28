from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FeedbackViewSet, ProviderStatusViewSet

router = DefaultRouter()
router.register(r'feedback', FeedbackViewSet)
router.register(r'provider-status', ProviderStatusViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
