# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from firebase_admin import auth as firebase_auth
from django.contrib.auth import get_user_model

User = get_user_model()

class FirebaseTokenVerifyView(APIView):
    def post(self, request):
        token = request.data.get('firebase_token')
        if not token:
            return Response({'error': 'Token missing'}, status=400)

        try:
            decoded_token = firebase_auth.verify_id_token(token)
            uid = decoded_token['uid']
            email = decoded_token.get('email', '')
            role = 'customer'

            user, created = User.objects.get_or_create(firebase_uid=uid, defaults={
                'email': email,
                'role': role,
                'username': uid  # ✅ this prevents UNIQUE constraint issue
            })

            return Response({
                'message': 'Token is valid',
                'uid': uid,
                'email': email,
                'role': user.role,
                'created': created
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_401_UNAUTHORIZED)