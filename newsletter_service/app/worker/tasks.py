from .celery_app import celery_app
from ..models.database import SessionLocal
from ..models.campaign import Campaign, CampaignStatus, RecipientLog, RecipientStatus
from ..models.subscriber import Subscriber, SubscriberStatus
from ..providers.sendgrid import SendGridProvider
from ..providers.ses import SESProvider
from sqlalchemy import and_
import time

BATCH_SIZE = 500

@celery_app.task(name="process_campaign")
def process_campaign_task(campaign_id: int):
    """Divide a campanha em lotes (batches) e agenda o envio"""
    db = SessionLocal()
    try:
        campaign = db.query(Campaign).get(campaign_id)
        if not campaign or campaign.status != CampaignStatus.QUEUED:
            return "Campaign not found or already processing"

        campaign.status = CampaignStatus.SENDING
        db.commit()

        # Selecionar subscritores ativos
        # Em produção: segmentar aqui usando campaign.segment_rules
        subscribers = db.query(Subscriber.id).filter(
            Subscriber.status == SubscriberStatus.ACTIVE
        ).all()
        
        subscriber_ids = [s.id for s in subscribers]
        
        # Criar lotes
        for i in range(0, len(subscriber_ids), BATCH_SIZE):
            batch = subscriber_ids[i:i + BATCH_SIZE]
            send_batch_task.delay(campaign_id, batch)
        
        return f"Campaign {campaign_id} queued in {len(subscriber_ids)//BATCH_SIZE + 1} batches"
    finally:
        db.close()

@celery_app.task(name="send_batch")
def send_batch_task(campaign_id: int, subscriber_ids: list):
    """Processa um lote de envios"""
    db = SessionLocal()
    try:
        campaign = db.query(Campaign).get(campaign_id)
        if not campaign:
            return "Campaign not found"

        # Escolher provider
        provider = SendGridProvider() if campaign.provider == "sendgrid" else SESProvider()

        for sub_id in subscriber_ids:
            # Idempotência: Verificar se já foi enviado para este sub nesta campanha
            existing = db.query(RecipientLog).filter(
                and_(
                    RecipientLog.campaign_id == campaign_id,
                    RecipientLog.subscriber_id == sub_id
                )
            ).first()
            
            if existing and existing.status in [RecipientStatus.SENT, RecipientStatus.DELIVERED]:
                continue
            
            subscriber = db.query(Subscriber).get(sub_id)
            if not subscriber or subscriber.status != SubscriberStatus.ACTIVE:
                continue

            # Criar Log
            log = RecipientLog(
                campaign_id=campaign_id,
                subscriber_id=sub_id,
                status=RecipientStatus.QUEUED
            )
            db.add(log)
            db.flush()

            try:
                # TODO: Compor HTML usando Jinja2 template
                html = f"<h1>{campaign.title}</h1><p>{campaign.excerpt}</p><a href='{campaign.url}'>Ler Artigo</a>"
                text = f"{campaign.title}\n\n{campaign.excerpt}\n\nLeia mais: {campaign.url}"
                
                msg_id = provider.send_one(
                    to_email=subscriber.email,
                    subject=f"Novo Artigo: {campaign.title}",
                    html_content=html,
                    text_content=text,
                    metadata={"campaign_id": str(campaign_id), "subscriber_id": str(sub_id)}
                )
                
                log.status = RecipientStatus.SENT
                log.provider_message_id = msg_id
                campaign.sent_count += 1
                
            except Exception as e:
                log.status = RecipientStatus.FAILED
                log.last_error = str(e)
            
            db.commit()
            
            # Rate limit básico para evitar bloqueio do provider (ex: 10 emails/sec)
            time.sleep(0.1)

    finally:
        db.close()
