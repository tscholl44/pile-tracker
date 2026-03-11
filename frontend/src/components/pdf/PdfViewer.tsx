'use client'

import { useState, useRef, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { PileOverlay } from './PileOverlay'
import { ColorPicker } from './ColorPicker'
import { pixelsToPercent } from '@/lib/utils'
import type { Pile } from '@/types'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

interface PdfViewerProps {
  pdfUrl: string
  piles: Pile[]
  selectedPileId: string | null
  planId: string
  currentPage: number
  onPageChange: (page: number) => void
  onPileSelect: (pileId: string | null) => void
  onPileCreate: (pile: Pile) => void
}

export function PdfViewer({
  pdfUrl,
  piles,
  selectedPileId,
  planId,
  currentPage,
  onPageChange,
  onPileSelect,
  onPileCreate,
}: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [scale, setScale] = useState(0.25)
  const [isPlacementMode, setIsPlacementMode] = useState(false)
  const [pendingClick, setPendingClick] = useState<{ x: number; y: number } | null>(null)
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }

  const onPageLoadSuccess = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setContainerDimensions({ width: rect.width, height: rect.height })
    }
  }, [])

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.25))

  const handlePrevPage = () => onPageChange(Math.max(currentPage - 1, 1))
  const handleNextPage = () => onPageChange(Math.min(currentPage + 1, numPages))

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlacementMode) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Convert to percentage
    const xPercent = pixelsToPercent(x, rect.width)
    const yPercent = pixelsToPercent(y, rect.height)

    setPendingClick({ x: xPercent, y: yPercent })
  }

  const handleColorSelect = async (color: string) => {
    if (!pendingClick) return

    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('piles')
        .insert({
          plan_id: planId,
          x_percent: pendingClick.x,
          y_percent: pendingClick.y,
          page_number: currentPage,
          color: color,
        })
        .select()
        .single()

      if (error) throw error

      onPileCreate(data as Pile)
      toast.success('Pile marker added')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create pile'
      toast.error(message)
    }

    setPendingClick(null)
    setIsPlacementMode(false)
  }

  const handleCancelPlacement = () => {
    setPendingClick(null)
    setIsPlacementMode(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPlacementMode(!isPlacementMode)}
            className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md ${
              isPlacementMode
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
            data-testid="add-pile-button"
          >
            <Plus className="h-4 w-4 mr-1" />
            {isPlacementMode ? 'Click to Place' : 'Add Pile'}
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {/* Zoom Controls */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
              data-testid="zoom-out-button"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-600 w-16 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
              data-testid="zoom-in-button"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
          </div>

          {/* Page Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded disabled:opacity-50"
              data-testid="prev-page-button"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-600" data-testid="page-indicator">
              Page {currentPage} of {numPages || '?'}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= numPages}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded disabled:opacity-50"
              data-testid="next-page-button"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* PDF Container */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        <div
          ref={containerRef}
          className={`relative inline-block ${isPlacementMode ? 'placement-mode' : ''}`}
          data-testid="pdf-viewer"
        >
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            }
            error={
              <div className="flex items-center justify-center h-96 text-red-600">
                Failed to load PDF
              </div>
            }
          >
            <Page
              pageNumber={currentPage}
              scale={scale}
              onLoadSuccess={onPageLoadSuccess}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              data-testid="pdf-page"
            />
          </Document>

          {/* Pile Overlay */}
          <PileOverlay
            piles={piles}
            selectedPileId={selectedPileId}
            onPileSelect={onPileSelect}
            onClick={handleOverlayClick}
            isPlacementMode={isPlacementMode}
          />
        </div>
      </div>

      {/* Color Picker Modal */}
      {pendingClick && (
        <ColorPicker
          onSelect={handleColorSelect}
          onCancel={handleCancelPlacement}
        />
      )}
    </div>
  )
}
