import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import LeadsList from '@/components/admin/leads/LeadsList'
import LeadsStats from '@/components/admin/leads/LeadsStats'

export default async function LeadsPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('email', session?.user.email)
    .single()

  // Fetch leads data
  const { data: leads } = await supabase
    .from('consultation_requests')
    .select(`
      *,
      employees!consultation_requests_assigned_to_fkey(full_name)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar employee={employee} />
      
      <div className="flex-1 lg:ml-64">
        <AdminHeader employee={employee} />
        
        <main className="p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
                <p className="mt-2 text-gray-600">
                  Track and manage consultation requests from customers
                </p>
              </div>
              <a
                href="/admin/leads/new"
                className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
              >
                + Add New Lead
              </a>
            </div>
          </div>

          <LeadsStats />
          
          <div className="mt-8">
            <LeadsList leads={leads || []} />
          </div>
        </main>
      </div>
    </div>
  )
}
