'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { PdfViewer } from '@/components/pdf/PdfViewer'
import { PileAttributesPanel } from '@/components/piles/PileAttributesPanel'
import type { Plan, Pile } from '@/types'

interface PlanViewerProps {
  plan: Plan
  piles: Pile[]
  pdfUrl: string
}

export function PlanViewer({ plan, piles: initialPiles, pdfUrl }: PlanViewerProps) {
  const [piles, setPiles] = useState<Pile[]>(initialPiles)
  const [selectedPileId, setSelectedPileId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isExporting, setIsExporting] = useState(false)

  const selectedPile = piles.find((p) => p.id === selectedPileId) || null

  const handlePileSelect = (pileId: string | null) => {
    setSelectedPileId(pileId)
  }

  const handlePileCreate = (newPile: Pile) => {
    setPiles((prev) => [...prev, newPile])
    setSelectedPileId(newPile.id)
  }

  const handlePileUpdate = (updatedPile: Pile) => {
    setPiles((prev) =>
      prev.map((p) => (p.id === updatedPile.id ? updatedPile : p))
    )
  }

  const handlePileDelete = (pileId: string) => {
    setPiles((prev) => prev.filter((p) => p.id !== pileId))
    if (selectedPileId === pileId) {
      setSelectedPileId(null)
    }
  }

  // Filter piles for current page
  const currentPagePiles = piles.filter((p) => p.page_number === currentPage)

  const handleExport = async () => {
    if (piles.length === 0) {
      toast.error('No pile markers to export')
      return
    }

    setIsExporting(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      const response = await fetch(`${apiUrl}/api/pdf/export/${plan.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_id: plan.id,
          piles: piles.map((p) => ({
            id: p.id,
            x_percent: p.x_percent,
            y_percent: p.y_percent,
            page_number: p.page_number,
            color: p.color,
            pile_installed: p.pile_installed,
            date_installed: p.date_installed,
            as_built_available: p.as_built_available,
            exceeded_tolerance: p.exceeded_tolerance,
            ncr: p.ncr,
            repairs: p.repairs,
            engineer_review: p.engineer_review,
            notes: p.notes,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to export PDF')
      }

      // Download the PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${plan.name}_annotated.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('PDF exported successfully')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Export failed'
      toast.error(message)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="h-[calc(100vh-8rem)]" data-testid="plan-viewer">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">{plan.name}</h1>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="export-pdf-button"
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {isExporting ? 'Exporting...' : 'Export PDF'}
        </button>
      </div>

      {/* Main Content - Split View */}
      <div className="flex h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* PDF Viewer - Left Side */}
        <div className="flex-1 min-w-0">
          <PdfViewer
            pdfUrl={pdfUrl}
            piles={currentPagePiles}
            selectedPileId={selectedPileId}
            planId={plan.id}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onPileSelect={handlePileSelect}
            onPileCreate={handlePileCreate}
          />
        </div>

        {/* Attributes Panel - Right Side */}
        <div className="w-80 border-l border-gray-200 bg-gray-50">
          <PileAttributesPanel
            pile={selectedPile}
            onUpdate={handlePileUpdate}
            onDelete={handlePileDelete}
          />
        </div>
      </div>
    </div>
  )
}
