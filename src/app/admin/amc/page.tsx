import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import AMCStats from '@/components/admin/amc/AMCStats'
import AMCList from '@/components/admin/amc/AMCList'

export default async function AMCPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('email', session?.user.email)
    .single()

  // Fetch AMC contracts data
  const { data: contracts } = await supabase
    .from('amc_contracts')
    .select(`
      *,
      customers(name, phone, email, address),
      projects(project_name, project_number),
      assigned_to:employees!amc_contracts_assigned_technician_id_fkey(full_name)
    `)
    .order('created_at', { ascending: false })

  // Get AMC stats
  const { data: statsData } = await supabase
    .from('amc_contracts')
    .select('status, annual_amount, start_date, end_date')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar employee={employee} />
      
      <div className="flex-1 lg:ml-64">
        <AdminHeader employee={employee} />
        
        <main className="p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">AMC Contracts</h1>
                <p className="mt-2 text-gray-600">
                  Manage annual maintenance contracts and service agreements
                </p>
              </div>
              <a
                href="/admin/amc/create"
                className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
              >
                + Create AMC Contract
              </a>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mb-8">
            <AMCStats contracts={statsData || []} />
          </div>

          {/* AMC Contracts List */}
          <div>
            <AMCList contracts={contracts || []} />
          </div>
        </main>
      </div>
    </div>
  )
}
