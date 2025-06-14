import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import ProjectSummaryDashboardEnhanced from '@/components/admin/projects/ProjectSummaryDashboardEnhanced'
import ProjectActivityTimelineEnhanced from '@/components/admin/projects/ProjectActivityTimelineEnhanced'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit } from 'lucide-react'
import Link from 'next/link'

interface ProjectDetailPageProps {
  params: { id: string }
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
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

  // Fetch project data with all relationships
  const { data: project } = await supabase
    .from('projects')
    .select(`
      *,
      customer:customers!projects_customer_id_fkey(*),
      project_manager:employees!projects_project_manager_id_fkey(*)
    `)
    .eq('id', params.id)
    .single()

  if (!project) {
    notFound()
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar employee={employee} />
      
      <div className="flex-1">
        <AdminHeader employee={employee} />
        
        <main className="p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/admin/projects">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Projects
                </Button>
              </Link>
              <Link href={`/admin/projects/edit/${project.id}`}>
                <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Project
                </Button>
              </Link>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.project_name}</h1>
              <p className="mt-2 text-gray-600">
                {project.project_number} • Comprehensive project overview and activity tracking
              </p>
            </div>
          </div>

          {/* Project Details Tabs */}
          <Tabs defaultValue="summary" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="summary">Summary & Financials</TabsTrigger>
              <TabsTrigger value="activity">Activity Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-6">
              <ProjectSummaryDashboardEnhanced project={project} />
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <ProjectActivityTimelineEnhanced project={project} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
