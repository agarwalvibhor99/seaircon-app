import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import QuotationsList from '@/components/admin/quotations/QuotationsList'
import QuotationsStats from '@/components/admin/quotations/QuotationsStats'

export default async function QuotationsPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('email', session?.user.email)
    .single()

  // Fetch quotations data
  const { data: quotations } = await supabase
    .from('quotations')
    .select(`
      *,
      consultation_requests(name, phone, email),
      customers(name, phone, email),
      created_by:employees!quotations_created_by_fkey(full_name),
      approved_by:employees!quotations_approved_by_fkey(full_name)
    `)
    .order('created_at', { ascending: false })

  // Get quotation stats
  const { data: statsData } = await supabase
    .from('quotations')
    .select('status, total_amount')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar employee={employee} />
      
      <div className="flex-1 lg:ml-64">
        <AdminHeader employee={employee} />
        
        <main className="p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Quotations & Proposals</h1>
                <p className="mt-2 text-gray-600">
                  Create, manage and track customer quotations
                </p>
              </div>
              <a
                href="/admin/quotations/create"
                className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
              >
                + Create Quotation
              </a>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mb-8">
            <QuotationsStats quotations={statsData || []} />
          </div>

          {/* Quotations List */}
          <div>
            <QuotationsList quotations={quotations || []} />
          </div>
        </main>
      </div>
    </div>
  )
}
