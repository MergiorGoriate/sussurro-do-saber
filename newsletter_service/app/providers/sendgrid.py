import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content
from .base import BaseEmailProvider
from ..core.config import settings

class SendGridProvider(BaseEmailProvider):
    def __init__(self):
        self.client = SendGridAPIClient(settings.SENDGRID_API_KEY)

    def send_one(self, to_email: str, subject: str, html_content: str, text_content: str, 
                 metadata: Optional[dict] = None) -> str:
        message = Mail(
            from_email=Email(settings.DEFAULT_FROM_EMAIL),
            to_emails=To(to_email),
            subject=subject,
            html_content=Content("text/html", html_content),
            plain_text_content=Content("text/plain", text_content)
        )
        
        if metadata:
            message.custom_args = metadata

        try:
            response = self.client.send(message)
            # SendGrid retorna X-Message-Id nos headers
            return response.headers.get("X-Message-Id")
        except Exception as e:
            raise Exception(f"SendGrid error: {str(e)}")

    def verify_webhook(self, payload: any, headers: dict) -> bool:
        # TODO: Implementar verificação de assinatura usando a chave pública do SendGrid
        return True

    def parse_events(self, payload: any) -> list:
        # SendGrid entrega uma lista de eventos
        events = []
        for item in payload:
            events.append({
                "email": item.get("email"),
                "event_type": item.get("event"), # delivered, bounce, spamreport
                "timestamp": item.get("timestamp"),
                "message_id": item.get("sg_message_id"),
                "reason": item.get("reason") # Para bounces
            })
        return events
