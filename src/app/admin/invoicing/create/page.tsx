import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import CreateInvoiceForm from '@/components/admin/invoicing/CreateInvoiceForm'

export default async function CreateInvoicePage() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('email', session?.user.email)
    .single()

  // Fetch projects for invoice creation
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      id,
      project_name,
      project_number,
      project_value,
      status,
      customers(id, name, email, phone, address),
      quotations(id, quotation_number, total_amount)
    `)
    .in('status', ['approved', 'in_progress', 'completed'])
    .order('created_at', { ascending: false })

  // Fetch customers for direct invoicing
  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, email, phone, address')
    .order('name')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar employee={employee} />
      
      <div className="flex-1 lg:ml-64">
        <AdminHeader employee={employee} />
        
        <main className="p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
                <p className="mt-2 text-gray-600">
                  Generate a new invoice for project billing
                </p>
              </div>
              <a
                href="/admin/invoicing"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to Invoicing
              </a>
            </div>
          </div>

          <CreateInvoiceForm 
            employee={employee}
            projects={projects || []}
            customers={customers || []}
          />
        </main>
      </div>
    </div>
  )
}
