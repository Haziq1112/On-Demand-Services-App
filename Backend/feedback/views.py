from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Feedback, ProviderStatus
from .serializers import FeedbackSerializer, ProviderStatusSerializer
from django.utils import timezone
from datetime import timedelta
from services.models import Service

class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer

    def perform_create(self, serializer):
        feedback = serializer.save()
        service = feedback.service
        self.update_provider_status(service)

    def update_provider_status(self, service):
        status_obj, created = ProviderStatus.objects.get_or_create(service=service)
        feedbacks = Feedback.objects.filter(service=service)

        # Count bad reviews (1-star or rating <= 1)
        bad_reviews = feedbacks.filter(rating__lte=1)
        bad_count = bad_reviews.count()

        # Check if any bad reviews within the last 7 days
        one_week_ago = timezone.now() - timedelta(days=7)
        recent_bad_comments = bad_reviews.filter(created_at__gte=one_week_ago)

        # Suspension logic:
        # 4 or more bad reviews OR at least 1 bad review → suspend 3 days + warning
        if bad_count >= 4 or bad_count >= 1:
            # Suspend for 3 days from now
            status_obj.suspended_until = timezone.now() + timedelta(days=3)
            status_obj.warning_issued = True
            status_obj.permanently_suspended = False
            status_obj.save()

        # If warning already issued and new bad comment in a week → permanent suspend
        if status_obj.warning_issued and recent_bad_comments.exists():
            status_obj.permanently_suspended = True
            status_obj.suspended_until = None
            status_obj.save()

class ProviderStatusViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ProviderStatus.objects.all()
    serializer_class = ProviderStatusSerializer
