from sqlalchemy import Column, Integer, String, DateTime, Boolean, JSON, Enum
from .database import Base
import datetime
import enum

class SubscriberStatus(str, enum.Enum):
    PENDING = "pending"
    ACTIVE = "active"
    UNSUBSCRIBED = "unsubscribed"
    BOUNCED = "bounced"
    COMPLAINED = "complained"

class Subscriber(Base):
    __tablename__ = "subscribers"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    status = Column(Enum(SubscriberStatus), default=SubscriberStatus.PENDING)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    confirmed_at = Column(DateTime, nullable=True)
    unsubscribed_at = Column(DateTime, nullable=True)
    
    source = Column(String, default="website") # site, footer, popup, etc.
    consent_proof = Column(JSON, nullable=True) # {ip, timestamp, user_agent, method}
    preferences = Column(JSON, default=lambda: {"categories": []})
    
    suppression_reason = Column(String, nullable=True)
    
    def __repr__(self):
        return f"<Subscriber {self.email} ({self.status})>"
