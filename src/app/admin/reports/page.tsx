import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import ReportsOverview from '@/components/admin/reports/ReportsOverview'

export default async function ReportsPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('email', session?.user.email)
    .single()

  // Fetch data for reports
  const { data: leads } = await supabase
    .from('consultation_requests')
    .select('status, service_type, created_at, urgency')

  const { data: projects } = await supabase
    .from('projects')
    .select('status, budget, created_at, start_date, end_date')

  const { data: quotations } = await supabase
    .from('quotations')
    .select('status, total_amount, created_at, valid_until')

  const { data: invoices } = await supabase
    .from('invoices')
    .select('status, total_amount, created_at, due_date, issue_date')

  const { data: installations } = await supabase
    .from('installations')
    .select('status, progress_percentage, installation_date, estimated_completion')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar employee={employee} />
      
      <div className="flex-1 lg:ml-64">
        <AdminHeader employee={employee} />
        
        <main className="p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="mt-2 text-gray-600">
                  Business insights and performance metrics
                </p>
              </div>
              <div className="flex gap-2">
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                  Export Data
                </button>
                <button className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors">
                  Generate Report
                </button>
              </div>
            </div>
          </div>

          <ReportsOverview 
            leads={leads || []}
            projects={projects || []}
            quotations={quotations || []}
            invoices={invoices || []}
            installations={installations || []}
          />
        </main>
      </div>
    </div>
  )
}
