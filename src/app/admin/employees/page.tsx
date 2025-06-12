import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import EmployeeManagement from '@/components/admin/EmployeeManagement'

export default async function EmployeesPage() {
  const supabase = createServerComponentClient({ cookies })
  
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar employee={employee} />
      
      <div className="flex-1 lg:ml-64">
        <AdminHeader employee={employee} />
        
        <main>
          <EmployeeManagement />
        </main>
      </div>
    </div>
  )
}
