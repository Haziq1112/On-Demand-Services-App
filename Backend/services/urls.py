from django.urls import path
from .views import (
    CreateProviderProfileView,
    UpdateProviderProfileView,
    CreateServiceView,
    UpdateServiceView,
    RetrieveProviderProfileView,
    ListProviderServicesView,
    RetrieveServiceView,
)

urlpatterns = [
    path('create-profile/', CreateProviderProfileView.as_view(), name='create-provider-profile'),
    path('update-profile/', UpdateProviderProfileView.as_view(), name='update-provider-profile'),
    path('add-service/', CreateServiceView.as_view(), name='add-service'),
    path('update-service/<int:pk>/', UpdateServiceView.as_view(), name='update-service'),
    path('profile/', RetrieveProviderProfileView.as_view(), name='get-provider-profile'),
    path('provider/services/', ListProviderServicesView.as_view(), name='list-provider-services'),
    path('services/<int:pk>/', RetrieveServiceView.as_view(), name='retrieve-service'),
]
