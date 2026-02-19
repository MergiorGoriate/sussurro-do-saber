from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from apps.articles.models import Profile, AuthorFollower
from .services import AnalyticsService

@receiver(post_save, sender=AuthorFollower)
def author_follower_update(sender, instance, created, **kwargs):
    """
    Trigger real-time update when someone follows an author.
    """
    if created:
        # Get total followers
        total_followers = AuthorFollower.objects.filter(author=instance.author).count()
        AnalyticsService.publish_author_update(
            instance.author.username, 
            'follower', 
            {'total': total_followers}
        )

@receiver(post_delete, sender=AuthorFollower)
def author_follower_delete(sender, instance, **kwargs):
    """
    Trigger real-time update when someone unfollows an author.
    """
    total_followers = AuthorFollower.objects.filter(author=instance.author).count()
    AnalyticsService.publish_author_update(
        instance.author.username, 
        'follower', 
        {'total': total_followers}
    )

@receiver(post_save, sender=Profile)
def profile_karma_update(sender, instance, **kwargs):
    """
    Trigger real-time update when karma changes.
    """
    # Check if karma changed? Ideally yes, but for now we just publish.
    # To check change, we need pre_save signal or comparison.
    # For MVP, just publishing is fine, frontend can ignore if same value.
    if instance.user:
        AnalyticsService.publish_author_update(
            instance.user.username,
            'karma',
            {'total': instance.karma}
        )
