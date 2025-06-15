'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import UnifiedProjectsList from '@/components/admin/projects/UnifiedProjectsList'
import ProjectsStats from '@/components/admin/projects/ProjectsStats'

export default function ProjectsPage() {
  const [employee, setEmployee] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [statsData, setStatsData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      console.log('🔄 Starting to load data...')
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession()
      console.log('👤 Session:', session?.user ? 'Authenticated' : 'Not authenticated')
      
      if (!session?.user) {
        console.error('❌ No authenticated user found')
        return
      }

      // Get employee details
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .eq('email', session.user.email)
        .single()

      if (employeeError) {
        console.error('❌ Error fetching employee:', employeeError)
        return
      }

      console.log('👨‍💼 Employee loaded:', employeeData?.full_name)
      setEmployee(employeeData)

      // Use API route to fetch projects (better authentication)
      console.log('📊 Fetching projects via API...')
      const projectsResponse = await fetch('/api/projects')
      const projectsResult = await projectsResponse.json()

      if (!projectsResponse.ok || !projectsResult.success) {
        console.error('❌ Error fetching projects via API:', projectsResult.error)
      } else {
        console.log('✅ Projects fetched successfully via API:', projectsResult.data?.length || 0, 'projects')
        setProjects(projectsResult.data || [])
      }

      // Fetch other data using direct Supabase calls (these should work)
      const [customersResult, employeesResult, statsResult] = await Promise.all([
        supabase.from('customers').select('*').order('name'),
        supabase.from('employees').select('*').eq('is_active', true).order('full_name'),
        fetch('/api/projects').then(r => r.json()).then(result => ({ data: result.success ? result.data?.map((p: any) => ({ status: p.status, project_value: p.project_value })) : [] }))
      ])

      setCustomers(customersResult.data || [])
      setEmployees(employeesResult.data || [])
      setStatsData(statsResult.data || [])

      console.log('✅ All data loaded successfully')

    } catch (error) {
      console.error('💥 Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600">Unable to load employee data</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar employee={employee} />
      
      <div className="flex-1">
        <AdminHeader employee={employee} />
        
        <main className="p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
                <p className="mt-2 text-gray-600">
                  Plan, assign and track project execution with comprehensive financial oversight
                </p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mb-8">
            <ProjectsStats projects={statsData || []} />
          </div>

          {/* Enhanced Projects List */}
          <div>
            <UnifiedProjectsList 
              projects={projects || []} 
              employee={employee}
              customers={customers || []}
              employees={employees || []}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
