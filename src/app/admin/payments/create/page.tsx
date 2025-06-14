import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import CreatePaymentForm from '@/components/admin/payments/CreatePaymentForm'

export default async function CreatePaymentPage() {
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

  // Fetch invoices with outstanding balances
  const { data: invoices } = await supabase
    .from('invoices')
    .select(`
      id,
      invoice_number,
      total_amount,
      amount_paid,
      balance_due,
      customer_id,
      customers(id, name, email, phone, address)
    `)
    .gt('balance_due', 0)
    .order('created_at', { ascending: false })

  // Fetch all customers for reference
  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, email, phone, address')
    .order('name')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar employee={employee} />
      
      <div className="flex-1">
        <AdminHeader employee={employee} />
        
        <main className="p-6">
          <CreatePaymentForm 
            employee={employee}
            invoices={invoices || []}
            customers={customers || []}
          />
        </main>
      </div>
    </div>
  )
}
