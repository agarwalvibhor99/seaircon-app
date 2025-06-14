import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import EditProjectForm from '@/components/admin/projects/EditProjectForm'

interface PageProps {
  params: {
    id: string
  }
}

export default async function EditProjectPage({ params }: PageProps) {
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
  
  if (!session) {
    redirect('/admin/login')
  }

  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('email', session?.user.email)
    .single()

  // Fetch the project to edit
  const { data: project, error } = await supabase
    .from('projects')
    .select(`
      *,
      customers(id, name, phone, email),
      project_manager:employees!projects_project_manager_id_fkey(id, full_name)
    `)
    .eq('id', params.id)
    .single()

  if (error || !project) {
    redirect('/admin/projects')
  }

  // Fetch all customers for the dropdown
  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, phone, email')
    .order('name')

  // Fetch all employees for project manager dropdown
  const { data: employees } = await supabase
    .from('employees')
    .select('id, full_name')
    .order('full_name')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar employee={employee} />
      
      <div className="flex-1">
        <AdminHeader employee={employee} />
        
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Edit Project</h1>
            <p className="mt-2 text-gray-600">
              Update project details and settings
            </p>
          </div>

          <EditProjectForm
            project={project}
            customers={customers || []}
            employees={employees || []}
          />
        </main>
      </div>
    </div>
  )
}
