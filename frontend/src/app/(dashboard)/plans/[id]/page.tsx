import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PlanViewer } from '@/components/plans/PlanViewer'
import type { Plan, Pile } from '@/types'

interface PageProps {
  params: { id: string }
}

export default async function PlanPage({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  // Fetch plan
  const { data: plan, error: planError } = await supabase
    .from('plans')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (planError || !plan) {
    notFound()
  }

  // Fetch piles for this plan
  const { data: piles } = await supabase
    .from('piles')
    .select('*')
    .eq('plan_id', params.id)
    .order('created_at', { ascending: true })

  // Get signed URL for PDF
  const { data: signedUrlData } = await supabase.storage
    .from('plans')
    .createSignedUrl(plan.original_file_path, 3600) // 1 hour expiry

  const pdfUrl = signedUrlData?.signedUrl || ''

  return (
    <PlanViewer
      plan={plan as Plan}
      piles={(piles || []) as Pile[]}
      pdfUrl={pdfUrl}
    />
  )
}
