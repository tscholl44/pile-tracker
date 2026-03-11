import fitz  # PyMuPDF
from typing import BinaryIO
import io

from app.models.schemas import PileExport


def hex_to_rgb(hex_color: str) -> tuple[float, float, float]:
    """Convert hex color to RGB tuple (0-1 range)."""
    hex_color = hex_color.lstrip("#")
    r = int(hex_color[0:2], 16) / 255
    g = int(hex_color[2:4], 16) / 255
    b = int(hex_color[4:6], 16) / 255
    return (r, g, b)


def export_annotated_pdf(
    pdf_file: BinaryIO,
    piles: list[PileExport],
    marker_radius: float = 10.0,
) -> bytes:
    """
    Merge pile markers onto a PDF and return the annotated PDF as bytes.

    Args:
        pdf_file: The original PDF file as a binary stream
        piles: List of pile annotations to draw
        marker_radius: Radius of the pile marker circles in points

    Returns:
        The annotated PDF as bytes
    """
    # Read PDF into memory
    pdf_bytes = pdf_file.read()
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")

    # Group piles by page
    piles_by_page: dict[int, list[PileExport]] = {}
    for pile in piles:
        page_num = pile.page_number - 1  # 0-indexed
        if page_num not in piles_by_page:
            piles_by_page[page_num] = []
        piles_by_page[page_num].append(pile)

    # Draw markers on each page
    for page_num, page_piles in piles_by_page.items():
        if page_num < 0 or page_num >= len(doc):
            continue

        page = doc[page_num]
        rect = page.rect

        for pile in page_piles:
            # Convert percentage to page coordinates
            x = rect.width * (pile.x_percent / 100)
            y = rect.height * (pile.y_percent / 100)

            # Get color
            color = hex_to_rgb(pile.color)

            # Create shape
            shape = page.new_shape()

            # Draw filled circle
            center = fitz.Point(x, y)
            shape.draw_circle(center, marker_radius)
            shape.finish(
                color=color,
                fill=color,
                fill_opacity=0.8,
                stroke_opacity=1.0,
                width=1.5,
            )

            # Draw white inner dot for visibility
            shape.draw_circle(center, marker_radius * 0.25)
            shape.finish(
                color=(1, 1, 1),
                fill=(1, 1, 1),
                fill_opacity=0.9,
            )

            shape.commit()

    # Save to bytes
    output = io.BytesIO()
    doc.save(output)
    doc.close()

    return output.getvalue()


def get_pdf_info(pdf_file: BinaryIO) -> dict:
    """
    Get information about a PDF file.

    Args:
        pdf_file: The PDF file as a binary stream

    Returns:
        Dictionary with page count and dimensions
    """
    pdf_bytes = pdf_file.read()
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")

    info = {
        "page_count": len(doc),
        "pages": [],
    }

    for i, page in enumerate(doc):
        rect = page.rect
        info["pages"].append({
            "page_number": i + 1,
            "width": rect.width,
            "height": rect.height,
        })

    doc.close()
    return info
