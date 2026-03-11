import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert percentage coordinates to pixel coordinates
 */
export function percentToPixels(percent: number, containerSize: number): number {
  return (percent / 100) * containerSize
}

/**
 * Convert pixel coordinates to percentage coordinates
 */
export function pixelsToPercent(pixels: number, containerSize: number): number {
  if (containerSize === 0) return 0
  return (pixels / containerSize) * 100
}

/**
 * Validate hex color format
 */
export function isValidHexColor(color: string): boolean {
  return /^#([0-9A-Fa-f]{3}){1,2}$/.test(color)
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
