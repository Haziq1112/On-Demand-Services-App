from django.urls import path
from .views import RegisterServiceProviderView, AddServiceView

urlpatterns = [
    path('provider/register/', RegisterServiceProviderView.as_view(), name='provider-register'),
    path('provider/add-service/', AddServiceView.as_view(), name='add-service'),
]
