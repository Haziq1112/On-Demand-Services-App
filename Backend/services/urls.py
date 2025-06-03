from django.urls import path
from .views import CreateProviderProfileView, CreateServiceView

urlpatterns = [
    path('create-profile/', CreateProviderProfileView.as_view(), name='create-provider-profile'),
    path('add-service/', CreateServiceView.as_view(), name='add-service'),
]
