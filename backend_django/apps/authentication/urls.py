from django.urls import path
from .views import (MagicLinkRequestView, MagicLinkVerifyView, SocialAuthView, 
                    GoogleLoginView, GoogleCallbackView, AppleLoginView, AppleCallbackView)

urlpatterns = [
    path('magic-link/', MagicLinkRequestView.as_view(), name='magic-link-request'),
    path('magic-link/verify/', MagicLinkVerifyView.as_view(), name='magic-link-verify'),
    path('social/', SocialAuthView.as_view(), name='social-auth'),
    
    # OAuth2 Routes
    path('google/login/', GoogleLoginView.as_view(), name='google-login'),
    path('google/callback/', GoogleCallbackView.as_view(), name='google-callback'),
    path('apple/login/', AppleLoginView.as_view(), name='apple-login'),
    path('apple/callback/', AppleCallbackView.as_view(), name='apple-callback'),
]
