from sqlalchemy.orm import Session
from ..models.subscriber import Subscriber, SubscriberStatus
from ..core.security import generate_secure_token, create_unsubscribe_token
import datetime

class NewsletterService:
    @staticmethod
    def request_subscription(db: Session, email: str, source: str = "website", consent_data: dict = None):
        """Inicia processo de subscrição (Double Opt-in)"""
        subscriber = db.query(Subscriber).filter(Subscriber.email == email).first()
        
        if subscriber:
            if subscriber.status == SubscriberStatus.ACTIVE:
                return subscriber, False # Já ativo
            # Se estava removido ou pendente, reinicia
            subscriber.status = SubscriberStatus.PENDING
        else:
            subscriber = Subscriber(
                email=email,
                status=SubscriberStatus.PENDING,
                source=source,
                consent_proof=consent_data
            )
            db.add(subscriber)
        
        # Gerar tokens (no MVP guardamos um hash ou token gerado para confirmação)
        # Em produção, poderíamos ter uma tabela de `SubscriptionTokens`
        # Aqui vamos simplificar usando a prova de consentimento para guardar o token pendente
        token = generate_secure_token()
        subscriber.consent_proof = {**(consent_data or {}), "confirm_token": token}
        
        db.commit()
        db.refresh(subscriber)
        return subscriber, token

    @staticmethod
    def confirm_subscription(db: Session, token: str):
        """Confirma o email do subscritor"""
        # Busca subscritor que tenha este token no JSON de consent_proof
        # (Nota: Em escala real, usaríamos uma tabela de tokens indexada)
        subscriber = db.query(Subscriber).filter(
            Subscriber.status == SubscriberStatus.PENDING
        ).all()
        
        for s in subscriber:
            if s.consent_proof and s.consent_proof.get("confirm_token") == token:
                s.status = SubscriberStatus.ACTIVE
                s.confirmed_at = datetime.datetime.utcnow()
                db.commit()
                return s
        return None

    @staticmethod
    def unsubscribe(db: Session, email: str):
        """Remove o subscritor da lista ativa"""
        subscriber = db.query(Subscriber).filter(Subscriber.email == email).first()
        if subscriber:
            subscriber.status = SubscriberStatus.UNSUBSCRIBED
            subscriber.unsubscribed_at = datetime.datetime.utcnow()
            db.commit()
            return True
        return False
