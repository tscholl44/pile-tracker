'use client'

import { X } from 'lucide-react'
import { PILE_COLORS } from '@/types'

interface ColorPickerProps {
  onSelect: (color: string) => void
  onCancel: () => void
}

export function ColorPicker({ onSelect, onCancel }: ColorPickerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" data-testid="color-picker">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-25"
        onClick={onCancel}
      />

      {/* Picker */}
      <div className="relative bg-white rounded-lg shadow-xl p-4 min-w-[200px]">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-gray-900">Select Color</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {PILE_COLORS.map((color) => (
            <button
              key={color.hex}
              onClick={() => onSelect(color.hex)}
              className="group relative"
              title={color.name}
              data-testid={`color-${color.name.toLowerCase()}`}
            >
              <div
                className="w-10 h-10 rounded-full border-2 border-gray-200 hover:border-gray-400 transition-colors"
                style={{ backgroundColor: color.hex }}
              />
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {color.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
