from django.urls import path
from .views import SignupView, LoginView, UserManagementView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('users/<int:user_id>/', UserManagementView.as_view(), name='user-management'),
]
