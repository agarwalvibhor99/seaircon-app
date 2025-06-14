import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import UnifiedInstallationsList from '@/components/admin/installations/UnifiedInstallationsList'
import InstallationsStats from '@/components/admin/installations/InstallationsStats'

export default async function InstallationsPage() {
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

  // Fetch data for forms
  const [projectsResult, employeesResult] = await Promise.all([
    supabase
      .from('projects')
      .select('*')
      .order('project_name'),
    supabase
      .from('employees')
      .select('*')
      .eq('is_active', true)
      .order('full_name')
  ])

  // Get installation stats
  const { data: statsData } = await supabase
    .from('installations')
    .select('status, progress_percentage')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar employee={employee} />
      
      <div className="flex-1">
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
            </div>
          </div>

          {/* Stats Section */}
          <div className="mb-8">
            <InstallationsStats installations={statsData || []} />
          </div>

          {/* Installations List */}
          <div>
            <UnifiedInstallationsList 
              installations={installations || []} 
              employee={employee}
              projects={projectsResult.data || []}
              employees={employeesResult.data || []}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
