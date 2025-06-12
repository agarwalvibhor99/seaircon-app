import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import SiteVisitsList from '@/components/admin/site-visits/SiteVisitsList'

export default async function SiteVisitsPage() {
  const supabase = createServerComponentClient({ cookies })
  
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar employee={employee} />
      
      <div className="flex-1 lg:ml-64">
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
              <a
                href="/admin/site-visits/schedule"
                className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
              >
                + Schedule Visit
              </a>
            </div>
          </div>
          
          <div className="mt-8">
            <SiteVisitsList visits={siteVisits || []} />
          </div>
        </main>
      </div>
    </div>
  )
}
