import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogOut } from 'lucide-react'
import Image from 'next/image'

async function signOut() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Image
                src="/pile-tracker-logo.png"
                alt="Pile Tracker Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <h1 className="text-xl font-bold text-gray-900">Pile Tracker</h1>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600" data-testid="user-menu">
                {user.email}
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
                  data-testid="logout-button"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
