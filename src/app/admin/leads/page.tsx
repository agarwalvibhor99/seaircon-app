import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import UnifiedLeadsList from '@/components/admin/leads/UnifiedLeadsList'
import LeadsStats from '@/components/admin/leads/LeadsStats'

export default async function LeadsPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
      },
    }
  )
  
  const { data: { session } } = await supabase.auth.getSession()
  
  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('email', session?.user.email)
    .single()

  // Fetch leads data
  const { data: leads } = await supabase
    .from('consultation_requests')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar employee={employee} />
      
      <div className="flex-1">
        <AdminHeader employee={employee} />
        
        <main className="p-6">
          {/* <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
                <p className="mt-2 text-gray-600">
                  Track and manage consultation requests from customers
                </p>
              </div>
            </div>
          </div> */}

          {/* <LeadsStats /> */}
          
          <div className="mt-8">
            <UnifiedLeadsList leads={leads || []} />
          </div>
        </main>
      </div>
    </div>
  )
}
