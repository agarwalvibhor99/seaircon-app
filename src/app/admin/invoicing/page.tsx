import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import InvoicesList from '@/components/admin/invoicing/InvoicesList'
import InvoicingStats from '@/components/admin/invoicing/InvoicingStats'

export default async function InvoicingPage() {
  const supabase = createServerComponentClient({ cookies })
  
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

  // Get payment data for stats
  const { data: payments } = await supabase
    .from('payments')
    .select('amount, status, payment_date')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar employee={employee} />
      
      <div className="flex-1 lg:ml-64">
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
              <a
                href="/admin/invoicing/create"
                className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
              >
                + Create Invoice
              </a>
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
            <InvoicesList invoices={invoices || []} />
          </div>
        </main>
      </div>
    </div>
  )
}
