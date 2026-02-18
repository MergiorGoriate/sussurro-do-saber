from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from sqlalchemy.orm import Session
from ...models.database import get_db
from ...services.newsletter import NewsletterService
from ...core.security import decode_unsubscribe_token
from pydantic import EmailStr, BaseModel

router = APIRouter()

class SubscribeRequest(BaseModel):
    email: EmailStr
    source: str = "website"

@router.post("/subscribe")
async def subscribe(req: SubscribeRequest, request: Request, db: Session = Depends(get_db)):
    consent_data = {
        "ip": request.client.host,
        "user_agent": request.headers.get("user-agent"),
        "timestamp": str(request.state.start_time if hasattr(request.state, 'start_time') else "")
    }
    subscriber, token = NewsletterService.request_subscription(
        db, req.email, req.source, consent_data
    )
    
    # TODO: Disparar email de confirmação via Celery
    return {"message": "Subscription requested. Please check your email to confirm."}

@router.get("/confirm")
async def confirm(token: str, db: Session = Depends(get_db)):
    subscriber = NewsletterService.confirm_subscription(db, token)
    if not subscriber:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    return {"message": f"Successfully subscribed: {subscriber.email}"}

@router.get("/unsubscribe")
async def unsubscribe(token: str, db: Session = Depends(get_db)):
    email = decode_unsubscribe_token(token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid unsubscribe link")
    
    success = NewsletterService.unsubscribe(db, email)
    if not success:
        return {"message": "You were already unsubscribed or not found."}
    return {"message": "Unsubscribed successfully."}
