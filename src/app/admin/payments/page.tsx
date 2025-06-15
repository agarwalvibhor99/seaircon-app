import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import UnifiedPaymentsList from '@/components/admin/payments/UnifiedPaymentsList'
import PaymentsStats from '@/components/admin/payments/PaymentsStats'

export default async function PaymentsPage() {
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

  // Fetch payments data
  const { data: payments } = await supabase
    .from('payments')
    .select(`
      *,
      invoices(invoice_number, total_amount, customers(name, phone)),
      recorded_by:employees!payments_recorded_by_fkey(full_name)
    `)
    .order('created_at', { ascending: false })

  // Fetch invoices for forms
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .order('invoice_number')

  // Get summary statistics
  const { data: stats } = await supabase
    .from('payments')
    .select('amount, payment_date')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar employee={employee} />
      
      <div className="flex-1">
        <AdminHeader employee={employee} />
        
        <main className="p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
                <p className="mt-2 text-gray-600">
                  Track and manage all customer payments
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="mb-8">
            <PaymentsStats payments={stats || []} />
          </div>

          <UnifiedPaymentsList 
            payments={payments || []} 
            employee={employee}
            invoices={invoices || []}
          />
        </main>
      </div>
    </div>
  )
}
