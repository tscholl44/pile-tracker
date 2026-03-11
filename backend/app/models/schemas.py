from pydantic import BaseModel
from typing import Optional
from datetime import date


class PileBase(BaseModel):
    """Base pile model for validation."""

    x_percent: float
    y_percent: float
    page_number: int
    color: str


class PileExport(PileBase):
    """Pile data for PDF export."""

    id: str
    pile_installed: Optional[bool] = None
    date_installed: Optional[date] = None
    as_built_available: Optional[bool] = None
    exceeded_tolerance: Optional[bool] = None
    ncr: Optional[bool] = None
    repairs: Optional[bool] = None
    engineer_review: Optional[bool] = None
    notes: Optional[str] = None


class ExportRequest(BaseModel):
    """Request body for PDF export."""

    plan_id: str
    piles: list[PileExport]


class ExportResponse(BaseModel):
    """Response for PDF export."""

    success: bool
    message: str
    file_url: Optional[str] = None
