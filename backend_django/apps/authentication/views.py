from rest_framework import views, status, response, permissions
from django.contrib.auth.models import User
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone
from .models import MagicToken
from .serializers import MagicLinkRequestSerializer, MagicLinkVerifySerializer, SocialAuthSerializer
from rest_framework_simplejwt.tokens import RefreshToken
import uuid

class MagicLinkRequestView(views.APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = MagicLinkRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            # Rate Limit Check (Simple: 5 requests per hour per email)
            from apps.analytics.services import redis_client
            
            rate_key = f"rate_limit:magic:{email}"
            current_attempts = redis_client.get(rate_key)
            if current_attempts and int(current_attempts) >= 5:
                return response.Response({'error': 'Muitas tentativas. Tente novamente mais tarde.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)
            
            # Increment Rate Limit
            if not current_attempts:
                redis_client.set(rate_key, 1, ex=3600)
            else:
                redis_client.incr(rate_key)

            # Generate Token
            token = uuid.uuid4().hex
            
            # Store in Redis (TTL 15 mins)
            magic_key = f"magic:{token}"
            redis_client.set(magic_key, email, ex=900)
            
            # Send Email
            magic_link = f"{settings.CORS_ALLOWED_ORIGINS[0]}/#/auth/verify?token={token}" # Frontend Hash Router
            try:
                # In production, use a proper template
                send_mail(
                    "Seu Link de Login - Sussurros do Saber",
                    f"Clique aqui para entrar: {magic_link}\n\nEste link expira em 15 minutos.",
                    settings.DEFAULT_FROM_EMAIL or 'noreply@sussurrosdosaber.pt',
                    [email],
                    fail_silently=False,
                )
            except Exception as e:
                print(f"Error sending email: {e}")
                # For dev/demo, we might want to return the token if email fails log it
                # return response.Response({'error': 'Failed to send email'}, status=500)
            
            return response.Response({'message': 'Magic link sent', 'debug_token': token if settings.DEBUG else None})
            
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MagicLinkVerifyView(views.APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = MagicLinkVerifySerializer(data=request.data)
        if serializer.is_valid():
            token_str = serializer.validated_data['token']
            try:
                magic_token = MagicToken.objects.get(token=token_str, is_used=False)
                if not magic_token.is_valid:
                     return response.Response({'error': 'Token expired'}, status=status.HTTP_400_BAD_REQUEST)
                
                # Mark used
                magic_token.is_used = True
                magic_token.save()
                
                # Get or Create User
                email = magic_token.email
                user, created = User.objects.get_or_create(username=email, defaults={'email': email})
                if created:
                    user.set_unusable_password()
                    user.save()
                
                # Generate JWT
                refresh = RefreshToken.for_user(user)
                
                return response.Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user_id': user.id,
                    'username': user.username,
                    'is_new': created
                })
                
            except MagicToken.DoesNotExist:
                return response.Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SocialAuthView(views.APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        # Mock implementation deprecated, kept for compatibility
        serializer = SocialAuthSerializer(data=request.data)
        if serializer.is_valid():
            provider = serializer.validated_data['provider']
            email = f"mock_{provider}@example.com" 
            if 'email' in request.data:
                email = request.data['email']
                
            user, created = User.objects.get_or_create(username=email, defaults={'email': email})
            if created:
                user.set_unusable_password()
                user.save()
                
            refresh = RefreshToken.for_user(user)
            return response.Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user_id': user.id,
                'username': user.username
            })
            
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# --- Google OAuth2 ---

class GoogleLoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        """
        Gera a URL de autorização do Google para o frontend redirecionar o usuário.
        """
        base_url = "https://accounts.google.com/o/oauth2/v2/auth"
        client_id = settings.GOOGLE_OAUTH2_KEY
        redirect_uri = f"{settings.CORS_ALLOWED_ORIGINS[0]}/#/auth/callback/google" # Frontend Route
        
        scope = "openid email profile"
        state = uuid.uuid4().hex # In prod, store this in Redis to validate in callback
        
        # Simulação para desenvolvimento sem chaves
        if not client_id or client_id == 'YOUR_GOOGLE_CLIENT_ID':
            # Retorna URL de callback direta com código simulado para dev
            mock_callback = f"{redirect_uri}?code=mock_google_code&state={state}"
            return response.Response({'url': mock_callback})

        params = {
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": scope,
            "state": state,
            "access_type": "offline",
            "include_granted_scopes": "true"
        }
        
        from urllib.parse import urlencode
        url = f"{base_url}?{urlencode(params)}"
        return response.Response({'url': url})


class GoogleCallbackView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        """
        Troca o code pelo token e autentica o usuário.
        """
        code = request.data.get('code')
        
        if not code:
            return response.Response({'error': 'Code is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Simulação Dev
        if code == 'mock_google_code':
            email = "mock_google_user@gmail.com"
            user, created = User.objects.get_or_create(username=email, defaults={
                'email': email,
                'first_name': 'Mock',
                'last_name': 'Google'
            })
            if created: user.set_unusable_password(); user.save()
            
            refresh = RefreshToken.for_user(user)
            return response.Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user_id': user.id,
                'username': user.username
            })
            
        # Real Implementation (requires requests lib)
        import requests
        token_url = "https://oauth2.googleapis.com/token"
        client_id = settings.GOOGLE_OAUTH2_KEY
        client_secret = settings.GOOGLE_OAUTH2_SECRET
        redirect_uri = f"{settings.CORS_ALLOWED_ORIGINS[0]}/#/auth/callback/google"

        data = {
            'code': code,
            'client_id': client_id,
            'client_secret': client_secret,
            'redirect_uri': redirect_uri,
            'grant_type': 'authorization_code'
        }

        try:
            # Exchange auth code for access token
            token_res = requests.post(token_url, data=data)
            token_res.raise_for_status()
            tokens = token_res.json()
            access_token = tokens['access_token']

            # Get User Info
            user_info_res = requests.get('https://www.googleapis.com/oauth2/v2/userinfo', headers={
                'Authorization': f'Bearer {access_token}'
            })
            user_info = user_info_res.json()
            
            email = user_info['email']
            first_name = user_info.get('given_name', '')
            last_name = user_info.get('family_name', '')
            
            # Find or Create User
            user, created = User.objects.get_or_create(username=email, defaults={
                'email': email,
                'first_name': first_name,
                'last_name': last_name
            })
            if created:
                user.set_unusable_password()
                user.save()

            refresh = RefreshToken.for_user(user)
            return response.Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user_id': user.id,
                'username': user.username
            })

        except Exception as e:
            print(f"Google Auth Error: {e}")
            return response.Response({'error': 'Failed to authenticate with Google'}, status=status.HTTP_400_BAD_REQUEST)


# --- Apple OAuth2 ---

class AppleLoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        base_url = "https://appleid.apple.com/auth/authorize"
        client_id = settings.APPLE_CLIENT_ID # Service ID
        redirect_uri = f"{settings.CORS_ALLOWED_ORIGINS[0]}/#/auth/callback/apple"
        
        state = uuid.uuid4().hex
        
        # Simulação
        if not client_id or client_id == 'YOUR_APPLE_CLIENT_ID':
             mock_callback = f"{redirect_uri}?code=mock_apple_code&state={state}"
             return response.Response({'url': mock_callback})

        params = {
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": "name email",
            "response_mode": "form_post", # Apple standard, but we might want query for SPA if supported or handle form post middleware
            "state": state
        }
        
        from urllib.parse import urlencode
        url = f"{base_url}?{urlencode(params)}"
        return response.Response({'url': url})

class AppleCallbackView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        code = request.data.get('code')
        if code == 'mock_apple_code':
             email = "mock_apple_user@icloud.com"
             user, created = User.objects.get_or_create(username=email, defaults={'email': email, 'first_name': 'Apple', 'last_name': 'User'})
             if created: user.set_unusable_password(); user.save()
             
             refresh = RefreshToken.for_user(user)
             return response.Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user_id': user.id,
                'username': user.username
            })
        
        return response.Response({'error': 'Apple Auth not fully configured (requires Key File)'}, status=501)
