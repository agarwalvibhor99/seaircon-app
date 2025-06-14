import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import UnifiedSiteVisitsList from '@/components/admin/site-visits/UnifiedSiteVisitsList'

export default async function SiteVisitsPage() {
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

  // Fetch site visits data
  const { data: siteVisits } = await supabase
    .from('site_visits')
    .select(`
      *,
      consultation_requests(name, phone),
      customers(name, phone),
      technician:employees!site_visits_technician_id_fkey(full_name),
      supervisor:employees!site_visits_supervisor_id_fkey(full_name)
    `)
    .order('visit_date', { ascending: false })

  // Fetch data for forms
  const [customersResult, employeesResult, leadsResult] = await Promise.all([
    supabase
      .from('customers')
      .select('*')
      .order('name'),
    supabase
      .from('employees')
      .select('*')
      .eq('is_active', true)
      .order('full_name'),
    supabase
      .from('consultation_requests')
      .select('*')
      .order('created_at', { ascending: false })
  ])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar employee={employee} />
      
      <div className="flex-1">
        <AdminHeader employee={employee} />
        
        <main className="p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Site Visits & Assessments</h1>
                <p className="mt-2 text-gray-600">
                  Schedule and manage customer site visits
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <UnifiedSiteVisitsList 
              visits={siteVisits || []}
              employee={employee}
              employees={employeesResult.data || []}
              leads={leadsResult.data || []}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
