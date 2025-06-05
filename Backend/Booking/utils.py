from datetime import timedelta
from django.utils import timezone
from .models import Feedback, ProviderBan
def evaluate_provider_ban(provider):
    feedbacks = Feedback.objects.filter(booking__provider=provider).order_by('-created_at')

    one_stars = [f for f in feedbacks if f.rating == 1]

    # Count 1-stars in last 4 days
    recent = [f for f in one_stars if f.created_at >= timezone.now() - timedelta(days=4)]

    # Check current bans
    try:
        ban = ProviderBan.objects.get(provider=provider)
        if ban.permanent:
            return
        if timezone.now() < ban.banned_until:
            return
    except ProviderBan.DoesNotExist:
        ban = None

    if len(one_stars) >= 5:
        if ban:
            if recent:
                ban.permanent = True
            else:
                ban.banned_until = timezone.now() + timedelta(hours=24)
            ban.save()
        else:
            ProviderBan.objects.create(provider=provider, banned_until=timezone.now() + timedelta(hours=24))
