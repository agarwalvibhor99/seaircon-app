import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import UnifiedInvoicesList from '@/components/admin/invoicing/UnifiedInvoicesList'
import InvoicingStats from '@/components/admin/invoicing/InvoicingStats'

export default async function InvoicingPage() {
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

  // Fetch invoices data
  const { data: invoices } = await supabase
    .from('invoices')
    .select(`
      *,
      projects(project_name, project_number),
      customers(name, phone, email),
      created_by:employees!invoices_created_by_fkey(full_name)
    `)
    .order('created_at', { ascending: false })

  // Fetch customers and projects for forms
  const [customersResult, projectsResult] = await Promise.all([
    supabase
      .from('customers')
      .select('*')
      .order('name'),
    supabase
      .from('projects')
      .select('*')
      .order('project_name')
  ])

  // Get payment data for stats
  const { data: payments } = await supabase
    .from('payments')
    .select('amount, status, payment_date')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar employee={employee} />
      
      <div className="flex-1">
        <AdminHeader employee={employee} />
        
        <main className="p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Invoicing & Payments</h1>
                <p className="mt-2 text-gray-600">
                  Manage billing, invoices and payment collection
                </p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mb-8">
            <InvoicingStats 
              invoices={invoices || []} 
              payments={payments || []} 
            />
          </div>

          {/* Invoices List */}
          <div>
            <UnifiedInvoicesList 
              invoices={invoices || []} 
              employee={employee}
              customers={customersResult.data || []}
              projects={projectsResult.data || []}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
