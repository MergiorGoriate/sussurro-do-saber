import boto3
from .base import BaseEmailProvider
from ..core.config import settings

class SESProvider(BaseEmailProvider):
    def __init__(self):
        self.client = boto3.client(
            'ses',
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )

    def send_one(self, to_email: str, subject: str, html_content: str, text_content: str, 
                 metadata: Optional[dict] = None) -> str:
        
        try:
            response = self.client.send_email(
                Source=settings.DEFAULT_FROM_EMAIL,
                Destination={'ToAddresses': [to_email]},
                Message={
                    'Subject': {'Data': subject},
                    'Body': {
                        'Html': {'Data': html_content},
                        'Text': {'Data': text_content}
                    }
                }
            )
            return response.get("MessageId")
        except Exception as e:
            raise Exception(f"AWS SES error: {str(e)}")

    def verify_webhook(self, payload: any, headers: dict) -> bool:
        # SES usa SNS para webhooks. SNS tem seu próprio mecanismo de verificação
        return True

    def parse_events(self, payload: any) -> list:
        # Implementar mapeamento de notificação SNS -> Evento Interno
        return []
