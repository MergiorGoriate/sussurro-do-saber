from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from ...models.database import get_db
from ...models.subscriber import Subscriber, SubscriberStatus
from ...models.campaign import RecipientLog, RecipientStatus
from ...providers.sendgrid import SendGridProvider
from ...providers.ses import SESProvider

router = APIRouter()

@router.post("/sendgrid")
async def sendgrid_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.json()
    provider = SendGridProvider()
    
    # Em prod: verify_webhook(payload, request.headers)
    events = provider.parse_events(payload)
    
    for event in events:
        process_event(db, event)
    
    return {"status": "ok"}

@router.post("/ses")
async def ses_webhook(request: Request, db: Session = Depends(get_db)):
    # SES -> SNS -> HTTP Webhook
    payload = await request.json()
    # TODO: Logica de verificação e parser do SNS
    return {"status": "ok"}

def process_event(db: Session, event: dict):
    email = event.get("email")
    event_type = event.get("event_type")
    
    subscriber = db.query(Subscriber).filter(Subscriber.email == email).first()
    if not subscriber:
        return

    if event_type in ["bounce", "spamreport", "dropped"]:
        subscriber.status = SubscriberStatus.BOUNCED if event_type == "bounce" else SubscriberStatus.COMPLAINED
        subscriber.suppression_reason = event.get("reason")
        db.commit()
    
    elif event_type == "delivered":
        # Atualizar log se tivermos o message_id
        log = db.query(RecipientLog).filter(RecipientLog.provider_message_id == event.get("message_id")).first()
        if log:
            log.status = RecipientStatus.DELIVERED
            db.commit()
