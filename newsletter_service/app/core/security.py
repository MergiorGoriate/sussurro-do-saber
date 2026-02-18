import secrets
import hashlib
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from ..core.config import settings

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

ALGORITHM = "HS256"

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def generate_secure_token() -> str:
    return secrets.token_urlsafe(32)

def create_unsubscribe_token(email: str) -> str:
    """Gera um token JWT assinado para descadastro sem login"""
    expire = datetime.utcnow() + timedelta(days=365) # Tokens de unsubscribe duram muito
    to_encode = {"sub": email, "exp": expire, "action": "unsubscribe"}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_unsubscribe_token(token: str) -> str:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("action") == "unsubscribe":
            return payload.get("sub")
    except Exception:
        return None
