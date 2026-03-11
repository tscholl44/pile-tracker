'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { PILE_COLORS } from '@/types'
import type { Pile } from '@/types'

interface PileAttributesPanelProps {
  pile: Pile | null
  onUpdate: (pile: Pile) => void
  onDelete: (pileId: string) => void
}

export function PileAttributesPanel({
  pile,
  onUpdate,
  onDelete,
}: PileAttributesPanelProps) {
  const [formData, setFormData] = useState<Partial<Pile>>({})
  const [isSaving, setIsSaving] = useState(false)

  // Reset form when pile changes
  useEffect(() => {
    if (pile) {
      setFormData({
        color: pile.color,
        pile_installed: pile.pile_installed ?? false,
        date_installed: pile.date_installed,
        as_built_available: pile.as_built_available ?? false,
        exceeded_tolerance: pile.exceeded_tolerance ?? false,
        ncr: pile.ncr ?? false,
        repairs: pile.repairs ?? false,
        engineer_review: pile.engineer_review ?? false,
        notes: pile.notes ?? '',
      })
    }
  }, [pile?.id])

  const saveChanges = useCallback(
    async (updates: Partial<Pile>) => {
      if (!pile) return

      setIsSaving(true)
      const supabase = createClient()

      try {
        const { data, error } = await supabase
          .from('piles')
          .update(updates)
          .eq('id', pile.id)
          .select()
          .single()

        if (error) throw error
        onUpdate(data as Pile)
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to save'
        toast.error(message)
      } finally {
        setIsSaving(false)
      }
    },
    [pile, onUpdate]
  )

  const handleToggle = (field: keyof Pile) => {
    const newValue = !formData[field]
    setFormData((prev) => ({ ...prev, [field]: newValue }))
    saveChanges({ [field]: newValue })
  }

  const handleDateChange = (value: string) => {
    const dateValue = value || null
    setFormData((prev) => ({ ...prev, date_installed: dateValue }))
    saveChanges({ date_installed: dateValue })
  }

  const handleNotesChange = (value: string) => {
    setFormData((prev) => ({ ...prev, notes: value }))
  }

  const handleNotesBlur = () => {
    saveChanges({ notes: formData.notes })
  }

  const handleColorChange = (color: string) => {
    setFormData((prev) => ({ ...prev, color }))
    saveChanges({ color })
  }

  const handleDelete = async () => {
    if (!pile) return

    if (!confirm('Are you sure you want to delete this pile marker?')) return

    const supabase = createClient()

    try {
      const { error } = await supabase.from('piles').delete().eq('id', pile.id)
      if (error) throw error
      onDelete(pile.id)
      toast.success('Pile marker deleted')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete'
      toast.error(message)
    }
  }

  if (!pile) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
        <p className="text-center">
          Select a pile marker to view and edit its attributes
        </p>
        <p className="text-sm mt-2 text-center">
          Or click &quot;Add Pile&quot; to place a new marker
        </p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col" data-testid="pile-attributes-panel">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Pile Attributes</h3>
        {isSaving && (
          <span className="text-xs text-gray-500">Saving...</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Color Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color
          </label>
          <div className="flex flex-wrap gap-2" data-testid="color-selector">
            {PILE_COLORS.map((color) => (
              <button
                key={color.hex}
                onClick={() => handleColorChange(color.hex)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  formData.color === color.hex
                    ? 'border-gray-900 scale-110'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
                data-testid={`pile-color-${color.name.toLowerCase()}`}
              />
            ))}
          </div>
          <div
            className="mt-2 flex items-center space-x-2"
            data-testid="pile-color-display"
          >
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: formData.color }}
            />
            <span className="text-sm text-gray-600">
              {PILE_COLORS.find((c) => c.hex === formData.color)?.name || 'Custom'}
            </span>
          </div>
        </div>

        {/* Toggle Fields */}
        <ToggleField
          label="Pile Installed"
          checked={formData.pile_installed ?? false}
          onChange={() => handleToggle('pile_installed')}
          testId="pile-installed-toggle"
        />

        {/* Date Field */}
        <div>
          <label
            htmlFor="date-installed"
            className="block text-sm font-medium text-gray-700"
          >
            Date Installed
          </label>
          <input
            id="date-installed"
            type="date"
            value={formData.date_installed ?? ''}
            onChange={(e) => handleDateChange(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            data-testid="date-installed-input"
          />
        </div>

        <ToggleField
          label="As-Built Available"
          checked={formData.as_built_available ?? false}
          onChange={() => handleToggle('as_built_available')}
          testId="as-built-toggle"
        />

        <ToggleField
          label="Exceeded Tolerance"
          checked={formData.exceeded_tolerance ?? false}
          onChange={() => handleToggle('exceeded_tolerance')}
          testId="tolerance-toggle"
        />

        <ToggleField
          label="NCR (Non-Compliance Report)"
          checked={formData.ncr ?? false}
          onChange={() => handleToggle('ncr')}
          testId="ncr-toggle"
        />

        <ToggleField
          label="Repairs"
          checked={formData.repairs ?? false}
          onChange={() => handleToggle('repairs')}
          testId="repairs-toggle"
        />

        <ToggleField
          label="Engineer Review"
          checked={formData.engineer_review ?? false}
          onChange={() => handleToggle('engineer_review')}
          testId="engineer-review-toggle"
        />

        {/* Notes */}
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700"
          >
            Notes
          </label>
          <textarea
            id="notes"
            rows={3}
            value={formData.notes ?? ''}
            onChange={(e) => handleNotesChange(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Add notes about this pile..."
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            data-testid="notes-input"
          />
        </div>
      </div>

      {/* Delete Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleDelete}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
          data-testid="delete-pile-button"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Pile Marker
        </button>
      </div>
    </div>
  )
}

interface ToggleFieldProps {
  label: string
  checked: boolean
  onChange: () => void
  testId: string
}

function ToggleField({ label, checked, onChange, testId }: ToggleFieldProps) {
  return (
    <div className="flex items-center justify-between">
      <label htmlFor={testId} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <button
        id={testId}
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
        data-testid={testId}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}
