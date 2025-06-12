import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import DashboardStats from '@/components/admin/DashboardStats'
import RecentActivity from '@/components/admin/RecentActivity'
import QuickActions from '@/components/admin/QuickActions'
import WorkflowNotifications from '@/components/admin/notifications/WorkflowNotifications'

export default async function AdminDashboard() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('email', session?.user.email)
    .single()

  // Fetch dashboard data
  const [
    { data: projects },
    { data: recentActivity }
  ] = await Promise.all([
    supabase
      .from('projects')
      .select('*, customers(name), employees!projects_project_manager_id_fkey(full_name)')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('contact_history')
      .select('*, consultation_requests(name), customers(name)')
      .order('created_at', { ascending: false })
      .limit(10)
  ])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar employee={employee} />
      
      <div className="flex-1 lg:ml-64">
        <AdminHeader employee={employee} />
        
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {employee?.full_name}
            </h1>
            <p className="mt-2 text-gray-600">
              Here&apos;s what&apos;s happening with your business today.
            </p>
          </div>

          <DashboardStats />
          
          {/* Workflow Notifications */}
          <div className="mt-8">
            <WorkflowNotifications 
              notifications={[]} 
              onMarkAsRead={() => {}} 
              onDismiss={() => {}} 
            />
          </div>
          
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RecentActivity activities={recentActivity || []} />
            <QuickActions />
          </div>
          
          {/* Recent Projects */}
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Projects</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Manager
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {projects?.map((project: { 
                      id: string; 
                      project_name: string; 
                      project_number: string; 
                      status: string; 
                      customers?: { name: string }; 
                      employees?: { full_name: string } 
                    }) => (
                      <tr key={project.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {project.project_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {project.project_number}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {project.customers?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            project.status === 'completed' ? 'bg-green-100 text-green-800' :
                            project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            project.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {project.employees?.full_name || 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <a href={`/admin/projects/${project.id}`} className="text-cyan-600 hover:text-cyan-900">
                            View
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
