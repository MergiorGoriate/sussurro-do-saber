from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Sussurros Newsletter Service"
    API_V1_STR: str = "/api/v1"
    
    DATABASE_URL: str = "postgresql://user:password@localhost/newsletter_db"
    REDIS_URL: str = "redis://localhost:6379/1"
    
    # Security
    SECRET_KEY: str = "CHANGE_ME_IN_PRODUCTION"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Providers
    SENDGRID_API_KEY: Optional[str] = None
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    
    # Emails
    DEFAULT_FROM_EMAIL: str = "Sussurros do Saber <newsletter@news.sussurrosdosaber.com>"
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"

settings = Settings()
