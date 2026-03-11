from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
import httpx

from app.core.config import get_settings
from app.models.schemas import ExportRequest, PileExport
from app.services.pdf_service import export_annotated_pdf, get_pdf_info

router = APIRouter()
settings = get_settings()


async def fetch_pdf_from_supabase(file_path: str) -> bytes:
    """Fetch a PDF file from Supabase Storage."""
    # Construct the storage URL
    url = f"{settings.supabase_url}/storage/v1/object/plans/{file_path}"

    headers = {
        "Authorization": f"Bearer {settings.supabase_service_key}",
        "apikey": settings.supabase_service_key,
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)

        if response.status_code != 200:
            raise HTTPException(
                status_code=404,
                detail=f"PDF not found: {response.status_code}"
            )

        return response.content


@router.post("/export/{plan_id}")
async def export_pdf(plan_id: str, request: ExportRequest):
    """
    Export a plan PDF with pile markers merged onto it.

    Args:
        plan_id: The plan ID
        request: Export request containing pile data

    Returns:
        The annotated PDF file
    """
    # Fetch plan details from Supabase
    from supabase import create_client

    supabase = create_client(settings.supabase_url, settings.supabase_service_key)

    # Get plan record
    result = supabase.table("plans").select("*").eq("id", plan_id).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Plan not found")

    plan = result.data
    file_path = plan["original_file_path"]

    # Fetch the PDF file
    try:
        pdf_bytes = await fetch_pdf_from_supabase(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch PDF: {str(e)}")

    # Export with annotations
    import io

    pdf_file = io.BytesIO(pdf_bytes)
    annotated_pdf = export_annotated_pdf(pdf_file, request.piles)

    # Return the PDF
    filename = f"{plan['name']}_annotated.pdf"

    return Response(
        content=annotated_pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )


@router.get("/info/{plan_id}")
async def get_pdf_info_endpoint(plan_id: str):
    """
    Get information about a plan's PDF.

    Args:
        plan_id: The plan ID

    Returns:
        PDF information including page count and dimensions
    """
    from supabase import create_client

    supabase = create_client(settings.supabase_url, settings.supabase_service_key)

    # Get plan record
    result = supabase.table("plans").select("*").eq("id", plan_id).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Plan not found")

    plan = result.data
    file_path = plan["original_file_path"]

    # Fetch the PDF file
    try:
        pdf_bytes = await fetch_pdf_from_supabase(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch PDF: {str(e)}")

    # Get PDF info
    import io

    pdf_file = io.BytesIO(pdf_bytes)
    info = get_pdf_info(pdf_file)

    return {
        "plan_id": plan_id,
        "plan_name": plan["name"],
        **info
    }
