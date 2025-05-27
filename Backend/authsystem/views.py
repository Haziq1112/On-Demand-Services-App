from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.status import HTTP_201_CREATED, HTTP_400_BAD_REQUEST
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser
from .serializers import UserSerializer

class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'User created successfully'}, status=HTTP_201_CREATED)
        return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = CustomUser.objects.filter(username=username).first()
        if user and user.check_password(password):
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'role': user.role,
            })
        return Response({'message': 'Invalid credentials'}, status=HTTP_400_BAD_REQUEST)

class UserManagementView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'super_admin':
            return Response({'message': 'Permission denied'}, status=HTTP_400_BAD_REQUEST)

        users = CustomUser.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    def patch(self, request, user_id):
        if request.user.role != 'super_admin':
            return Response({'message': 'Permission denied'}, status=HTTP_400_BAD_REQUEST)

        user = CustomUser.objects.get(id=user_id)
        new_role = request.data.get('role')
        if new_role in ['admin', 'customer']:
            user.role = new_role
            user.save()
            return Response({'message': 'Role updated successfully'})
        return Response({'message': 'Invalid role'}, status=HTTP_400_BAD_REQUEST)
