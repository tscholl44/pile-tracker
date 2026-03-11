// Database types

export interface User {
  id: string
  email: string
  full_name: string | null
  created_at: string
}

export interface Plan {
  id: string
  user_id: string
  name: string
  original_file_path: string
  modified_file_path: string | null
  page_count: number | null
  created_at: string
  updated_at: string
}

export interface Pile {
  id: string
  plan_id: string
  x_percent: number
  y_percent: number
  page_number: number
  color: string
  pile_installed: boolean | null
  date_installed: string | null
  as_built_available: boolean | null
  exceeded_tolerance: boolean | null
  ncr: boolean | null
  repairs: boolean | null
  engineer_review: boolean | null
  notes: string | null
  created_at: string
  updated_at: string
}

// Form types

export interface CreatePlanInput {
  name: string
  file: File
}

export interface CreatePileInput {
  plan_id: string
  x_percent: number
  y_percent: number
  page_number: number
  color: string
}

export interface UpdatePileInput {
  color?: string
  pile_installed?: boolean
  date_installed?: string | null
  as_built_available?: boolean
  exceeded_tolerance?: boolean
  ncr?: boolean
  repairs?: boolean
  engineer_review?: boolean
  notes?: string
}

// UI types

export interface PileColor {
  name: string
  hex: string
}

export const PILE_COLORS: PileColor[] = [
  { name: 'Red', hex: '#EF4444' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Yellow', hex: '#EAB308' },
  { name: 'Green', hex: '#22C55E' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Purple', hex: '#A855F7' },
  { name: 'Gray', hex: '#6B7280' },
]
