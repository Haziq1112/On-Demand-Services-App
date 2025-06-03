# backend/your_app/authentication.py

from rest_framework import authentication, exceptions
from firebase_admin import auth as firebase_auth

class FirebaseAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return None

        parts = auth_header.split()

        if parts[0].lower() != 'bearer' or len(parts) != 2:
            raise exceptions.AuthenticationFailed('Invalid Authorization header.')

        id_token = parts[1]

        try:
            decoded_token = firebase_auth.verify_id_token(id_token)
        except Exception:
            raise exceptions.AuthenticationFailed('Invalid Firebase ID token.')

        uid = decoded_token.get('uid')
        email = decoded_token.get('email', '')
        username = email.split('@')[0] if email else uid

        from django.contrib.auth import get_user_model
        User = get_user_model()

        # Ensure consistent matching with firebase_uid
        user, created = User.objects.get_or_create(firebase_uid=uid, defaults={
            'email': email,
            'username': username
        })

        return (user, None)
