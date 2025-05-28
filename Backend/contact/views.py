from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from django.conf import settings

class ContactFormAPIView(APIView):
    def post(self, request):
        data = request.data
        name = data.get('name')
        email = data.get('email')
        subject = data.get('subject')
        message = data.get('message')

        if not name or not email or not subject or not message:
            return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

        full_message = f"Name: {name}\nEmail: {email}\n\nMessage:\n{message}"

        try:
            send_mail(
                subject=subject,
                message=full_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.CONTACT_RECEIVER_EMAIL],
                fail_silently=False,
            )
            return Response({"success": "Message sent successfully!"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Failed to send email: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
