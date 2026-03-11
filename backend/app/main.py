from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.api.routes import pdf, health

settings = get_settings()

app = FastAPI(
    title="Pile Tracker API",
    description="Backend API for PDF annotation and export",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(pdf.router, prefix="/pdf", tags=["PDF"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Pile Tracker API", "version": "0.1.0"}
