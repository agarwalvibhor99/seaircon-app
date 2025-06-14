import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import EditPaymentForm from '@/components/admin/payments/EditPaymentForm'

interface PageProps {
  params: {
    id: string
  }
}

export default async function EditPaymentPage({ params }: PageProps) {
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

  // Fetch the payment to edit
  const { data: payment, error } = await supabase
    .from('payments')
    .select(`
      *,
      invoices(id, invoice_number, total_amount, customers(id, name, phone, email))
    `)
    .eq('id', params.id)
    .single()

  if (error || !payment) {
    redirect('/admin/payments')
  }

  // Fetch all invoices for the dropdown
  const { data: invoices } = await supabase
    .from('invoices')
    .select(`
      id, 
      invoice_number, 
      total_amount,
      customers(id, name, phone, email)
    `)
    .order('invoice_number')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar employee={employee} />
      
      <div className="flex-1">
        <AdminHeader employee={employee} />
        
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Edit Payment</h1>
            <p className="mt-2 text-gray-600">
              Update payment details and information
            </p>
          </div>

          <EditPaymentForm
            payment={payment}
            invoices={invoices || []}
          />
        </main>
      </div>
    </div>
  )
}
