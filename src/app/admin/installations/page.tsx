import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import InstallationsList from '@/components/admin/installations/InstallationsList'
import InstallationsStats from '@/components/admin/installations/InstallationsStats'

export default async function InstallationsPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('email', session?.user.email)
    .single()

  // Fetch installations data
  const { data: installations } = await supabase
    .from('installations')
    .select(`
      *,
      projects(project_name, project_number),
      customers(name, phone, email),
      technician_lead:employees!installations_technician_lead_id_fkey(full_name),
      supervisor:employees!installations_supervisor_id_fkey(full_name)
    `)
    .order('installation_date', { ascending: false })

  // Get installation stats
  const { data: statsData } = await supabase
    .from('installations')
    .select('status, progress_percentage')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar employee={employee} />
      
      <div className="flex-1 lg:ml-64">
        <AdminHeader employee={employee} />
        
        <main className="p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Installation Tracking</h1>
                <p className="mt-2 text-gray-600">
                  Monitor and manage HVAC installation progress
                </p>
              </div>
              <a
                href="/admin/installations/schedule"
                className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
              >
                + Schedule Installation
              </a>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mb-8">
            <InstallationsStats installations={statsData || []} />
          </div>

          {/* Installations List */}
          <div>
            <InstallationsList installations={installations || []} />
          </div>
        </main>
      </div>
    </div>
  )
}
