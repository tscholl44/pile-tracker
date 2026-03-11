'use client'

import { PileMarker } from './PileMarker'
import type { Pile } from '@/types'

interface PileOverlayProps {
  piles: Pile[]
  selectedPileId: string | null
  onPileSelect: (pileId: string | null) => void
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void
  isPlacementMode: boolean
}

export function PileOverlay({
  piles,
  selectedPileId,
  onPileSelect,
  onClick,
  isPlacementMode,
}: PileOverlayProps) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only handle direct clicks on the overlay, not on markers
    if (e.target === e.currentTarget) {
      if (isPlacementMode) {
        onClick(e)
      } else {
        // Deselect when clicking on empty area
        onPileSelect(null)
      }
    }
  }

  return (
    <div
      className={`absolute inset-0 ${isPlacementMode ? 'cursor-crosshair' : ''}`}
      onClick={handleClick}
      data-testid="pdf-overlay"
    >
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      >
        {piles.map((pile) => (
          <PileMarker
            key={pile.id}
            pile={pile}
            isSelected={selectedPileId === pile.id}
            onSelect={() => onPileSelect(pile.id)}
          />
        ))}
      </svg>
    </div>
  )
}
