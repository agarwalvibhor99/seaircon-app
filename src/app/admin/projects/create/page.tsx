import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import CreateProjectForm from '@/components/admin/projects/CreateProjectForm'

export default async function CreateProjectPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('email', session?.user.email)
    .single()

  // Fetch customers for dropdown
  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, email, phone')
    .order('name')

  // Fetch quotations for dropdown
  const { data: quotations } = await supabase
    .from('quotations')
    .select('id, quotation_number, client_name, total_amount, status')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  // Fetch employees for project manager selection
  const { data: employees } = await supabase
    .from('employees')
    .select('id, full_name, role')
    .in('role', ['admin', 'manager', 'employee'])
    .eq('status', 'active')
    .order('full_name')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar employee={employee} />
      
      <div className="flex-1 lg:ml-64">
        <AdminHeader employee={employee} />
        
        <main className="p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
                <p className="mt-2 text-gray-600">
                  Create a new project from approved quotations or direct customer requests
                </p>
              </div>
            </div>
          </div>

          <CreateProjectForm 
            employee={employee}
            customers={customers || []}
            quotations={quotations || []}
            employees={employees || []}
          />
        </main>
      </div>
    </div>
  )
}
