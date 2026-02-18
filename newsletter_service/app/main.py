from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import time
from .core.config import settings
from .api.endpoints import subscribers, events, webhooks

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Middleware para medir tempo (usado no consent_proof)
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    request.state.start_time = time.time()
    response = await call_next(request)
    return response

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Em prod, restringir ao frontend e monólito
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(subscribers.router, prefix=f"{settings.API_V1_STR}/subscribers", tags=["subscribers"])
app.include_router(events.router, prefix=f"{settings.API_V1_STR}/events", tags=["events"])
app.include_router(webhooks.router, prefix=f"{settings.API_V1_STR}/webhooks", tags=["webhooks"])

@app.get("/")
def read_root():
    return {"status": "up", "service": settings.PROJECT_NAME}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
