'use client'

import type { Pile } from '@/types'

interface PileMarkerProps {
  pile: Pile
  isSelected: boolean
  onSelect: () => void
}

const MARKER_RADIUS = 12

export function PileMarker({ pile, isSelected, onSelect }: PileMarkerProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect()
  }

  return (
    <g
      style={{ pointerEvents: 'auto', cursor: 'pointer' }}
      onClick={handleClick}
      data-testid="pile-marker"
    >
      {/* Outer ring for selected state */}
      {isSelected && (
        <circle
          cx={`${pile.x_percent}%`}
          cy={`${pile.y_percent}%`}
          r={MARKER_RADIUS + 4}
          fill="none"
          stroke={pile.color}
          strokeWidth="2"
          strokeDasharray="4 2"
          className="animate-pulse"
        />
      )}

      {/* Main marker circle */}
      <circle
        cx={`${pile.x_percent}%`}
        cy={`${pile.y_percent}%`}
        r={MARKER_RADIUS}
        fill={pile.color}
        fillOpacity={0.8}
        stroke="white"
        strokeWidth={isSelected ? 3 : 2}
        className="pile-marker transition-transform hover:scale-125"
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      />

      {/* Inner dot for better visibility */}
      <circle
        cx={`${pile.x_percent}%`}
        cy={`${pile.y_percent}%`}
        r={3}
        fill="white"
        fillOpacity={0.9}
      />
    </g>
  )
}
