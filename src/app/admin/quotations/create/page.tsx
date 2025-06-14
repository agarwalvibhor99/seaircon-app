import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import CreateQuotationForm from '@/components/admin/quotations/CreateQuotationForm'

export default async function CreateQuotationPage() {
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

  // Fetch customers for selection
  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, email, phone, address')
    .order('name')

  // Fetch consultation requests that don't have quotations yet
  const { data: consultationRequests } = await supabase
    .from('consultation_requests')
    .select('id, name, email, phone, service_type, message')
    .eq('status', 'completed') // Only completed site visits
    .order('created_at', { ascending: false })

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar employee={employee} />
      
      <div className="flex-1">
        <AdminHeader employee={employee} />
        
        <main className="p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create Quotation</h1>
                <p className="mt-2 text-gray-600">
                  Generate a detailed quotation for your customer
                </p>
              </div>
              <a
                href="/admin/quotations"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to Quotations
              </a>
            </div>
          </div>

          <CreateQuotationForm 
            employee={employee}
            customers={customers || []}
            consultationRequests={consultationRequests || []}
          />
        </main>
      </div>
    </div>
  )
}
