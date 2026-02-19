from rest_framework import serializers
from .models import MagicToken

class MagicLinkRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class MagicLinkVerifySerializer(serializers.Serializer):
    token = serializers.CharField()

class SocialAuthSerializer(serializers.Serializer):
    provider = serializers.ChoiceField(choices=['google', 'apple'])
    token = serializers.CharField()
    email = serializers.EmailField(required=False)
    name = serializers.CharField(required=False)
