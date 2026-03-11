'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, Upload, X } from 'lucide-react'
import { formatFileSize } from '@/lib/utils'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export function UploadPlanButton() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [planName, setPlanName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed')
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size must be less than 50MB')
      return
    }

    setSelectedFile(file)
    // Use filename without extension as default plan name
    setPlanName(file.name.replace(/\.pdf$/i, ''))
  }

  const handleUpload = async () => {
    if (!selectedFile || !planName.trim()) {
      toast.error('Please select a file and enter a plan name')
      return
    }

    setIsUploading(true)
    const supabase = createClient()

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Generate unique file path
      const timestamp = Date.now()
      const safeName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filePath = `${user.id}/${timestamp}-${safeName}`

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('plans')
        .upload(filePath, selectedFile)

      if (uploadError) throw uploadError

      // Create plan record in database
      const { data: plan, error: dbError } = await supabase
        .from('plans')
        .insert({
          user_id: user.id,
          name: planName.trim(),
          original_file_path: filePath,
        })
        .select()
        .single()

      if (dbError) throw dbError

      toast.success('Plan uploaded successfully!')
      setIsOpen(false)
      setSelectedFile(null)
      setPlanName('')
      router.refresh()

      // Navigate to the new plan
      if (plan) {
        router.push(`/plans/${plan.id}`)
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Upload failed'
      toast.error(message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        data-testid="upload-plan-button"
      >
        <Plus className="h-4 w-4 mr-2" />
        Upload Plan
      </button>

      {/* Upload Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" data-testid="upload-dialog">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-25"
              onClick={() => !isUploading && setIsOpen(false)}
            />

            {/* Dialog */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Upload Foundation Plan
                </h3>
                <button
                  onClick={() => !isUploading && setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                  disabled={isUploading}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* File Drop Zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {selectedFile ? (
                    <div>
                      <FileIcon className="mx-auto h-12 w-12 text-blue-500" />
                      <p className="mt-2 text-sm font-medium text-gray-900">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        Click to select a PDF file
                      </p>
                      <p className="text-xs text-gray-500">Max 50MB</p>
                    </div>
                  )}
                </div>

                {/* Plan Name Input */}
                <div>
                  <label
                    htmlFor="plan-name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Plan Name
                  </label>
                  <input
                    id="plan-name"
                    type="text"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder="e.g., Building A Foundation"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    data-testid="plan-name-input"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setIsOpen(false)}
                    disabled={isUploading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={isUploading || !selectedFile || !planName.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="upload-submit"
                  >
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  )
}
