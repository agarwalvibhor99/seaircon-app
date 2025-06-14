import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import EditInvoiceForm from '@/components/admin/invoicing/EditInvoiceForm'

interface PageProps {
  params: {
    id: string
  }
}

export default async function EditInvoicePage({ params }: PageProps) {
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

  // Fetch the invoice to edit
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select(`
      *,
      projects(id, project_name, project_number, customers(id, name, phone, email)),
      customers(id, name, phone, email)
    `)
    .eq('id', params.id)
    .single()

  if (error || !invoice) {
    redirect('/admin/invoicing')
  }

  // Fetch all projects for the dropdown
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      id, 
      project_name, 
      project_number,
      customers(id, name, phone, email)
    `)
    .order('project_name')

  // Fetch all customers for the dropdown
  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, phone, email')
    .order('name')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar employee={employee} />
      
      <div className="flex-1">
        <AdminHeader employee={employee} />
        
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Edit Invoice</h1>
            <p className="mt-2 text-gray-600">
              Update invoice details and settings
            </p>
          </div>

          <EditInvoiceForm
            invoice={invoice}
            projects={projects || []}
            customers={customers || []}
          />
        </main>
      </div>
    </div>
  )
}
