import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import ProjectsList from '@/components/admin/projects/ProjectsList'
import ProjectsStats from '@/components/admin/projects/ProjectsStats'

export default async function ProjectsPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('email', session?.user.email)
    .single()

  // Fetch projects data
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      *,
      customers(name, phone, email),
      project_manager:employees!projects_project_manager_id_fkey(full_name),
      quotations(quotation_number, total_amount)
    `)
    .order('created_at', { ascending: false })

  // Get project stats
  const { data: statsData } = await supabase
    .from('projects')
    .select('status, budget')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar employee={employee} />
      
      <div className="flex-1 lg:ml-64">
        <AdminHeader employee={employee} />
        
        <main className="p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
                <p className="mt-2 text-gray-600">
                  Plan, assign and track project execution
                </p>
              </div>
              <a
                href="/admin/projects/create"
                className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
              >
                + Create Project
              </a>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mb-8">
            <ProjectsStats projects={statsData || []} />
          </div>

          {/* Projects List */}
          <div>
            <ProjectsList projects={projects || []} />
          </div>
        </main>
      </div>
    </div>
  )
}
