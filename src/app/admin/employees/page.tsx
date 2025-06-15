import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import UnifiedEmployeeList from '@/components/admin/employees/UnifiedEmployeeList'
import EmployeesStats from '@/components/admin/employees/EmployeesStats'

export default async function EmployeesPage() {
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

  if (!employee) {
    redirect('/admin/login')
  }

  // Check if user has permission to access employee management
  if (!['admin', 'manager'].includes(employee.role)) {
    redirect('/admin/dashboard')
  }

  // Fetch all employees
  const { data: employees } = await supabase
    .from('employees')
    .select('*')
    .order('full_name')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar employee={employee} />
      
      <div className="flex-1">
        <AdminHeader employee={employee} />
        
        <main className="p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
                <p className="mt-2 text-gray-600">
                  Manage employee records, roles, and access permissions
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="mb-8">
            <EmployeesStats employees={employees || []} />
          </div>
          
          <UnifiedEmployeeList employees={employees || []} />
        </main>
      </div>
    </div>
  )
}
