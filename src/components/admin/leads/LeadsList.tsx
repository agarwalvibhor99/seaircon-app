'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { Download, FileText, FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  service_type: string
  status: string
  urgency_level: string
  location?: string
  source: string
  created_at: string
  employees?: { full_name: string } | null
}

interface LeadsListProps {
  leads: Lead[]
}

export default function LeadsList({ leads }: LeadsListProps) {
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredLeads = leads.filter(lead => {
    const matchesFilter = filter === 'all' || lead.status === filter
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone.includes(searchTerm) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800'
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800'
      case 'qualified':
        return 'bg-green-100 text-green-800'
      case 'site_visit_scheduled':
        return 'bg-purple-100 text-purple-800'
      case 'converted':
        return 'bg-green-100 text-green-800'
      case 'lost':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Export functions
  const exportToExcel = () => {
    const exportData = filteredLeads.map(lead => ({
      'Name': lead.name,
      'Email': lead.email,
      'Phone': lead.phone,
      'Location': lead.location || 'N/A',
      'Service Type': lead.service_type.replace('_', ' '),
      'Status': lead.status.replace('_', ' '),
      'Urgency': lead.urgency_level,
      'Source': lead.source.replace('_', ' '),
      'Assigned To': lead.employees?.full_name || 'Unassigned',
      'Created Date': new Date(lead.created_at).toLocaleDateString()
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Leads')
    
    // Auto-size columns
    const colWidths = Object.keys(exportData[0] || {}).map(key => {
      const maxLength = Math.max(
        key.length,
        ...exportData.map(row => String(row[key as keyof typeof row]).length)
      )
      return { wch: Math.min(maxLength + 2, 50) }
    })
    ws['!cols'] = colWidths

    const fileName = `leads-export-${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  const exportToPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4') // landscape orientation
    
    // Add title
    doc.setFontSize(18)
    doc.text('SE Aircon - Leads Report', 20, 20)
    
    doc.setFontSize(12)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30)
    doc.text(`Total Records: ${filteredLeads.length}`, 20, 38)

    // Prepare table data
    const tableData = filteredLeads.map(lead => [
      lead.name,
      lead.phone,
      lead.email,
      lead.service_type.replace('_', ' '),
      lead.status.replace('_', ' '),
      lead.urgency_level,
      lead.source.replace('_', ' '),
      new Date(lead.created_at).toLocaleDateString()
    ])

    // Add table
    doc.autoTable({
      head: [['Name', 'Phone', 'Email', 'Service', 'Status', 'Urgency', 'Source', 'Created']],
      body: tableData,
      startY: 45,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [8, 145, 178], // cyan-600 color
        textColor: 255
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251] // gray-50
      },
      margin: { top: 45, left: 20, right: 20 }
    })

    const fileName = `leads-report-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>All Leads ({filteredLeads.length})</CardTitle>
          <div className="flex items-center space-x-4">
            {/* Export Buttons */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToExcel}
                className="flex items-center space-x-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Excel</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToPDF}
                className="flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>PDF</span>
              </Button>
            </div>
            
            {/* Search and Filter */}
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="site_visit_scheduled">Site Visit Scheduled</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Urgency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                      {lead.location && (
                        <div className="text-sm text-gray-500">{lead.location}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{lead.phone}</div>
                    <div className="text-sm text-gray-500">{lead.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize">
                      {lead.service_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getStatusColor(lead.status)}>
                      {lead.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getUrgencyColor(lead.urgency_level)}>
                      {lead.urgency_level}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {lead.source.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <a
                      href={`/admin/leads/${lead.id}`}
                      className="text-cyan-600 hover:text-cyan-900"
                    >
                      View
                    </a>
                    <a
                      href={`/admin/site-visits/schedule?lead=${lead.id}`}
                      className="text-green-600 hover:text-green-900"
                    >
                      Schedule Visit
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredLeads.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No leads found matching your criteria</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
