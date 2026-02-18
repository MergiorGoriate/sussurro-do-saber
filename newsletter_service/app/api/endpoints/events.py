from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from ...models.database import get_db
from ...models.campaign import Campaign, CampaignStatus
from ...worker.tasks import process_campaign_task
from pydantic import BaseModel, UUID4
from typing import Optional
import datetime

router = APIRouter()

class ArticlePublishedEvent(BaseModel):
    event_id: str
    occurred_at: datetime.datetime
    article_id: int
    title: str
    excerpt: str
    canonical_url: str
    category: Optional[str] = "Geral"
    author_name: Optional[str] = None

@router.post("/article-published")
async def handle_article_published(event: ArticlePublishedEvent, db: Session = Depends(get_db)):
    """Recebe o evento do monólito e cria uma campanha"""
    
    # Idempotência: Verifica se o event_id já foi processado
    existing = db.query(Campaign).filter(Campaign.event_id == event.event_id).first()
    if existing:
        return {"message": "Event already processed", "campaign_id": existing.id}
    
    new_campaign = Campaign(
        event_id=event.event_id,
        article_id=event.article_id,
        title=event.title,
        excerpt=event.excerpt,
        url=event.canonical_url,
        status=CampaignStatus.QUEUED
    )
    
    db.add(new_campaign)
    db.commit()
    db.refresh(new_campaign)
    
    # Disparar tarefa de processamento em batch via Celery
    process_campaign_task.delay(new_campaign.id)
    
    return {"status": "campaign_created", "id": new_campaign.id}
