from sqlalchemy import Column, Integer, String, DateTime, Boolean, JSON, Enum, ForeignKey, Text, UUID
from sqlalchemy.orm import relationship
from .database import Base
import datetime
import enum
import uuid

class CampaignStatus(str, enum.Enum):
    QUEUED = "queued"
    SENDING = "sending"
    PAUSED = "paused"
    FINISHED = "finished"
    FAILED = "failed"

class RecipientStatus(str, enum.Enum):
    QUEUED = "queued"
    SENT = "sent"
    DELIVERED = "delivered"
    BOUNCED = "bounced"
    COMPLAINED = "complained"
    FAILED = "failed"
    SKIPPED = "skipped"

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String, unique=True, index=True, nullable=False) # Idempotência do article.published
    article_id = Column(Integer, nullable=False)
    
    title = Column(String, nullable=False)
    excerpt = Column(Text, nullable=True)
    url = Column(String, nullable=False)
    cover_image_url = Column(String, nullable=True)
    
    segment_rules = Column(JSON, default=lambda: {})
    provider = Column(String, default="sendgrid") # sendgrid, ses
    
    status = Column(Enum(CampaignStatus), default=CampaignStatus.QUEUED)
    
    started_at = Column(DateTime, nullable=True)
    finished_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Métricas agregadas
    sent_count = Column(Integer, default=0)
    delivered_count = Column(Integer, default=0)
    bounced_count = Column(Integer, default=0)
    
    logs = relationship("RecipientLog", back_populates="campaign")

class RecipientLog(Base):
    __tablename__ = "recipient_logs"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), index=True)
    subscriber_id = Column(Integer, ForeignKey("subscribers.id"), index=True)
    
    status = Column(Enum(RecipientStatus), default=RecipientStatus.QUEUED)
    provider_message_id = Column(String, nullable=True, index=True)
    
    last_error = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    campaign = relationship("Campaign", back_populates="logs")
