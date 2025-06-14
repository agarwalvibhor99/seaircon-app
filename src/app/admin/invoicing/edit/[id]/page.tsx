import { redirect } from 'next/navigation'

interface PageProps {
  params: {
    id: string
  }
}

export default function EditInvoicePage({ params }: PageProps) {
  redirect('/admin/invoicing')
}
