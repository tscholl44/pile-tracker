import { createClient } from '@/lib/supabase/server'
import { Plus, FileText, Calendar } from 'lucide-react'
import Link from 'next/link'
import { UploadPlanButton } from '@/components/plans/UploadPlanButton'
import type { Plan } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: plans, error } = await supabase
    .from('plans')
    .select('*')
    .eq('user_id', user?.id)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching plans:', error)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Plans</h2>
          <p className="mt-1 text-sm text-gray-600">
            Upload and manage your foundation plans
          </p>
        </div>
        <UploadPlanButton />
      </div>

      {plans && plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan: Plan) => (
            <Link
              key={plan.id}
              href={`/plans/${plan.id}`}
              className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              data-testid="plan-card"
            >
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {plan.name}
                    </h3>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(plan.updated_at).toLocaleDateString()}
                    </div>
                    {plan.page_count && (
                      <p className="mt-1 text-sm text-gray-500">
                        {plan.page_count} page{plan.page_count > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No plans yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by uploading your first foundation plan.
          </p>
          <div className="mt-6">
            <UploadPlanButton />
          </div>
        </div>
      )}
    </div>
  )
}
