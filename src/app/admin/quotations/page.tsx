import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import UnifiedQuotationsList from '@/components/admin/quotations/UnifiedQuotationsList'
import QuotationsStats from '@/components/admin/quotations/QuotationsStats'

export default async function QuotationsPage() {
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

  // Fetch customers
  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .order('name')

  // Fetch projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('project_name')

  // Fetch consultation requests (leads)
  const { data: consultationRequests } = await supabase
    .from('consultation_requests')
    .select('*')
    .eq('status', 'new')
    .order('created_at', { ascending: false })

  // Get quotation stats
  const { data: statsData } = await supabase
    .from('quotations')
    .select('status, total_amount')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar employee={employee} />
      
      <div className="flex-1">
        <AdminHeader employee={employee} />
        
        <main className="p-6">
          <div className="mb-8">
            <QuotationsStats quotations={statsData || []} />
          </div>

          <div>
            <UnifiedQuotationsList 
              quotations={quotations || []} 
              employee={employee}
              customers={customers || []}
              projects={projects || []}
              consultationRequests={consultationRequests || []}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
