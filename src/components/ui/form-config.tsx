'use client'

import React from 'react'
import { User, Mail, Phone, Building, MapPin, AlertCircle, Calendar, DollarSign, FileText, Package, Wrench, Users, ClipboardList, CreditCard, Receipt } from 'lucide-react'

// Common form configuration types
export interface FormFieldConfig {
  name: string
  label: string
  type: 'text' | 'email' | 'tel' | 'number' | 'password' | 'date' | 'datetime-local' | 'time' | 'textarea' | 'select' | 'currency' | 'display' | 'line-items'
  required?: boolean
  placeholder?: string
  hint?: string
  options?: { value: string; label: string; description?: string; color?: string }[]
  showBadges?: boolean
  min?: number | string
  max?: number | string
  step?: number | string
  rows?: number
  icon?: React.ReactNode
  disabled?: boolean
  currency?: string
  validation?: (value: any) => string | undefined
  dependsOn?: string
  showWhen?: (formData: any) => boolean
}

export interface FormSectionConfig {
  title?: string
  description?: string
  fields: FormFieldConfig[]
  columns?: 1 | 2 | 3 | 4
  showWhen?: (formData: any) => boolean
}

export interface FormConfig {
  title: string
  subtitle?: string
  sections: FormSectionConfig[]
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'
  submitLabel?: string
  module: 'leads' | 'projects' | 'quotations' | 'invoices' | 'payments' | 'employees' | 'sitevisits' | 'installations' | 'amc'
  disableAutoToast?: boolean  // Flag to disable automatic success toast
}

// Common field options
export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
]

export const STATUS_OPTIONS = {
  leads: [
    { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
    { value: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'qualified', label: 'Qualified', color: 'bg-green-100 text-green-800' },
    { value: 'proposal_sent', label: 'Proposal Sent', color: 'bg-purple-100 text-purple-800' },
    { value: 'negotiation', label: 'Negotiation', color: 'bg-orange-100 text-orange-800' },
    { value: 'won', label: 'Won', color: 'bg-green-100 text-green-800' },
    { value: 'lost', label: 'Lost', color: 'bg-red-100 text-red-800' }
  ],
  projects: [
    { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
    { value: 'planning', label: 'Planning', color: 'bg-blue-100 text-blue-800' },
    { value: 'approved', label: 'Approved', color: 'bg-cyan-100 text-cyan-800' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'on_hold', label: 'On Hold', color: 'bg-orange-100 text-orange-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  ],
  quotations: [
    { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
    { value: 'sent', label: 'Sent', color: 'bg-blue-100 text-blue-800' },
    { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
    { value: 'expired', label: 'Expired', color: 'bg-orange-100 text-orange-800' }
  ],
  invoices: [
    { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
    { value: 'sent', label: 'Sent', color: 'bg-blue-100 text-blue-800' },
    { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-800' },
    { value: 'overdue', label: 'Overdue', color: 'bg-red-100 text-red-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-800' }
  ],
  payments: [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800' },
    { value: 'refunded', label: 'Refunded', color: 'bg-orange-100 text-orange-800' }
  ],
  sitevisits: [
    { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  ],
  installations: [
    { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'on_hold', label: 'On Hold', color: 'bg-orange-100 text-orange-800' }
  ],
  amc: [
    { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
    { value: 'expired', label: 'Expired', color: 'bg-red-100 text-red-800' },
    { value: 'suspended', label: 'Suspended', color: 'bg-orange-100 text-orange-800' }
  ],
  employees: [
    { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
    { value: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800' },
    { value: 'on_leave', label: 'On Leave', color: 'bg-orange-100 text-orange-800' }
  ]
}

export const SERVICE_TYPE_OPTIONS = [
  { value: 'installation', label: 'Installation', color: 'bg-blue-100 text-blue-800' },
  { value: 'maintenance', label: 'Maintenance', color: 'bg-green-100 text-green-800' },
  { value: 'repair', label: 'Repair', color: 'bg-red-100 text-red-800' },
  { value: 'consultation', label: 'Consultation', color: 'bg-purple-100 text-purple-800' },
  { value: 'amc', label: 'AMC', color: 'bg-orange-100 text-orange-800' }
]

export const PROPERTY_TYPE_OPTIONS = [
  { value: 'residential', label: 'Residential', color: 'bg-blue-100 text-blue-800' },
  { value: 'commercial', label: 'Commercial', color: 'bg-green-100 text-green-800' },
  { value: 'industrial', label: 'Industrial', color: 'bg-orange-100 text-orange-800' }
]

export const CONTACT_METHOD_OPTIONS = [
  { value: 'phone', label: 'Phone', color: 'bg-blue-100 text-blue-800' },
  { value: 'email', label: 'Email', color: 'bg-green-100 text-green-800' },
  { value: 'whatsapp', label: 'WhatsApp', color: 'bg-emerald-100 text-emerald-800' }
]

export const LEAD_SOURCE_OPTIONS = [
  { value: 'website', label: 'Website', color: 'bg-blue-100 text-blue-800' },
  { value: 'referral', label: 'Referral', color: 'bg-green-100 text-green-800' },
  { value: 'advertisement', label: 'Advertisement', color: 'bg-purple-100 text-purple-800' },
  { value: 'cold_call', label: 'Cold Call', color: 'bg-orange-100 text-orange-800' },
  { value: 'walk_in', label: 'Walk-in', color: 'bg-cyan-100 text-cyan-800' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' }
]

export const DEPARTMENT_OPTIONS = [
  { value: 'management', label: 'Management', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'sales', label: 'Sales', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'technical', label: 'Technical', color: 'bg-green-100 text-green-800' },
  { value: 'operations', label: 'Operations', color: 'bg-blue-100 text-blue-800' },
  { value: 'accounts', label: 'Accounts', color: 'bg-purple-100 text-purple-800' }
]

export const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin', color: 'bg-red-100 text-red-800' },
  { value: 'manager', label: 'Manager', color: 'bg-blue-100 text-blue-800' },
  { value: 'employee', label: 'Employee', color: 'bg-green-100 text-green-800' },
  { value: 'technician', label: 'Technician', color: 'bg-orange-100 text-orange-800' }
]

export const PAYMENT_METHOD_OPTIONS = [
  { value: 'cash', label: 'Cash', color: 'bg-green-100 text-green-800' },
  { value: 'bank_transfer', label: 'Bank Transfer', color: 'bg-blue-100 text-blue-800' },
  { value: 'upi', label: 'UPI', color: 'bg-purple-100 text-purple-800' },
  { value: 'credit_card', label: 'Credit Card', color: 'bg-orange-100 text-orange-800' },
  { value: 'debit_card', label: 'Debit Card', color: 'bg-cyan-100 text-cyan-800' },
  { value: 'cheque', label: 'Cheque', color: 'bg-yellow-100 text-yellow-800' }
]

export const VISIT_TYPE_OPTIONS = [
  { value: 'consultation', label: 'Consultation', color: 'bg-purple-100 text-purple-800' },
  { value: 'installation', label: 'Installation', color: 'bg-blue-100 text-blue-800' },
  { value: 'maintenance', label: 'Maintenance', color: 'bg-green-100 text-green-800' },
  { value: 'repair', label: 'Repair', color: 'bg-red-100 text-red-800' },
  { value: 'inspection', label: 'Inspection', color: 'bg-orange-100 text-orange-800' }
]

// Form configuration generators
export const getLeadFormConfig = (): FormConfig => ({
  title: 'Add New Lead',
  subtitle: 'Capture potential customer information',
  module: 'leads',
  maxWidth: '4xl',
  submitLabel: 'Create Lead',
  disableAutoToast: true,  // Disable automatic toast - handle manually in specific pages
  sections: [
    {
      title: 'Basic Information',
      fields: [
        {
          name: 'name',
          label: 'Full Name',
          type: 'text',
          required: true,
          placeholder: 'Enter full name',
          icon: <User className="h-4 w-4" />
        },
        {
          name: 'email',
          label: 'Email Address',
          type: 'email',
          required: true,
          placeholder: 'Enter email address',
          icon: <Mail className="h-4 w-4" />
        },
        {
          name: 'phone',
          label: 'Phone Number',
          type: 'tel',
          required: true,
          placeholder: 'Enter phone number',
          icon: <Phone className="h-4 w-4" />
        },
        {
          name: 'company',
          label: 'Company/Organization',
          type: 'text',
          placeholder: 'Enter company name (optional)',
          icon: <Building className="h-4 w-4" />
        }
      ],
      columns: 2
    },
    {
      title: 'Service Requirements',
      fields: [
        {
          name: 'service_type',
          label: 'Service Type',
          type: 'select',
          required: true,
          options: SERVICE_TYPE_OPTIONS,
          showBadges: true
        },
        {
          name: 'urgency_level',
          label: 'Urgency Level',
          type: 'select',
          required: true,
          options: [
            { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
            { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
            { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
            { value: 'emergency', label: 'Emergency', color: 'bg-red-100 text-red-800' }
          ],
          showBadges: true,
          icon: <AlertCircle className="h-4 w-4" />
        },
        {
          name: 'property_type',
          label: 'Property Type',
          type: 'select',
          required: true,
          options: PROPERTY_TYPE_OPTIONS,
          showBadges: true
        },
        {
          name: 'location',
          label: 'Location',
          type: 'text',
          placeholder: 'Enter location/address',
          icon: <MapPin className="h-4 w-4" />
        }
      ],
      columns: 2
    },
    {
      title: 'Additional Information',
      fields: [
        {
          name: 'estimated_value',
          label: 'Estimated Project Value',
          type: 'currency',
          placeholder: 'Enter estimated value (optional)',
          currency: 'INR'
        },
        {
          name: 'source',
          label: 'Lead Source',
          type: 'select',
          required: true,
          options: LEAD_SOURCE_OPTIONS,
          showBadges: true
        },
        {
          name: 'preferred_contact_method',
          label: 'Preferred Contact Method',
          type: 'select',
          required: true,
          options: CONTACT_METHOD_OPTIONS,
          showBadges: true
        },
        {
          name: 'preferred_contact_time',
          label: 'Preferred Contact Time',
          type: 'text',
          placeholder: 'e.g., 9 AM - 6 PM, Weekends'
        }
      ],
      columns: 2
    },
    {
      title: 'Message & Notes',
      fields: [
        {
          name: 'message',
          label: 'Requirements/Message',
          type: 'textarea',
          required: true,
          placeholder: 'Describe the customer\'s requirements and needs...',
          rows: 4
        },
        {
          name: 'notes',
          label: 'Additional Notes',
          type: 'textarea',
          placeholder: 'Any additional information or special instructions...',
          rows: 3
        }
      ],
      columns: 1
    }
  ]
})

export const getEmployeeFormConfig = (): FormConfig => ({
  title: 'Add New Employee',
  subtitle: 'Create a new employee account',
  module: 'employees',
  maxWidth: '4xl',
  submitLabel: 'Create Employee',
  sections: [
    {
      title: 'Personal Information',
      fields: [
        {
          name: 'full_name',
          label: 'Full Name',
          type: 'text',
          required: true,
          placeholder: 'Enter full name',
          icon: <User className="h-4 w-4" />
        },
        {
          name: 'email',
          label: 'Email Address',
          type: 'email',
          required: true,
          placeholder: 'Enter email address',
          icon: <Mail className="h-4 w-4" />
        },
        {
          name: 'phone',
          label: 'Phone Number',
          type: 'tel',
          required: true,
          placeholder: 'Enter phone number',
          icon: <Phone className="h-4 w-4" />
        },
        {
          name: 'address',
          label: 'Address',
          type: 'textarea',
          placeholder: 'Enter address',
          rows: 2
        }
      ],
      columns: 2
    },
    {
      title: 'Job Information',
      fields: [
        {
          name: 'department',
          label: 'Department',
          type: 'select',
          required: true,
          options: DEPARTMENT_OPTIONS,
          showBadges: true
        },
        {
          name: 'role',
          label: 'Role',
          type: 'select',
          required: true,
          options: ROLE_OPTIONS,
          showBadges: true
        },
        {
          name: 'designation',
          label: 'Designation',
          type: 'text',
          required: true,
          placeholder: 'Enter job title/designation'
        },
        {
          name: 'hire_date',
          label: 'Hire Date',
          type: 'date',
          required: true
        }
      ],
      columns: 2
    },
    {
      title: 'Employment Details',
      fields: [
        {
          name: 'salary',
          label: 'Monthly Salary',
          type: 'currency',
          currency: 'INR',
          placeholder: 'Enter monthly salary'
        },
        {
          name: 'employee_id',
          label: 'Employee ID',
          type: 'text',
          placeholder: 'Enter employee ID (optional)'
        },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          required: true,
          options: STATUS_OPTIONS.employees,
          showBadges: true
        }
      ],
      columns: 3
    }
  ]
})

export const getProjectFormConfig = (customers: any[] = [], employees: any[] = []): FormConfig => ({
  title: 'Create New Project',
  subtitle: 'Plan and manage a new project',
  module: 'projects',
  maxWidth: '5xl',
  submitLabel: 'Create Project',
  sections: [
    {
      title: 'Project Information',
      fields: [
        {
          name: 'project_name',
          label: 'Project Name',
          type: 'text',
          required: true,
          placeholder: 'Enter project name',
          icon: <FileText className="h-4 w-4" />
        },
        {
          name: 'project_type',
          label: 'Project Type',
          type: 'select',
          required: true,
          options: SERVICE_TYPE_OPTIONS,
          showBadges: true
        },
        {
          name: 'priority',
          label: 'Priority',
          type: 'select',
          required: true,
          options: PRIORITY_OPTIONS,
          showBadges: true
        },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          required: true,
          options: STATUS_OPTIONS.projects,
          showBadges: true
        }
      ],
      columns: 2
    },
    {
      title: 'Customer & Assignment',
      fields: [
        {
          name: 'customer_id',
          label: 'Customer',
          type: 'select',
          required: true,
          options: customers.map(c => ({ value: c.id, label: c.name }))
        },
        {
          name: 'project_manager_id',
          label: 'Project Manager',
          type: 'select',
          required: true,
          options: employees.filter(e => e.role === 'manager' || e.role === 'admin').map(e => ({ value: e.id, label: e.full_name }))
        },
        {
          name: 'supervisor_id',
          label: 'Supervisor',
          type: 'select',
          options: employees.filter(e => e.role === 'manager' || e.role === 'employee' || e.role === 'technician').map(e => ({ value: e.id, label: e.full_name }))
        }
      ],
      columns: 3
    },
    {
      title: 'Timeline & Budget',
      fields: [
        {
          name: 'estimated_start_date',
          label: 'Estimated Start Date',
          type: 'date',
          required: true
        },
        {
          name: 'estimated_end_date',
          label: 'Estimated End Date',
          type: 'date',
          required: true
        },
        {
          name: 'project_value',
          label: 'Project Value',
          type: 'currency',
          currency: 'INR',
          required: true
        },
        {
          name: 'advance_amount',
          label: 'Advance Amount',
          type: 'currency',
          currency: 'INR'
        }
      ],
      columns: 2
    },
    {
      title: 'Location & Details',
      fields: [
        {
          name: 'site_address',
          label: 'Project Address',
          type: 'textarea',
          required: true,
          placeholder: 'Enter complete project address',
          rows: 2
        },
        {
          name: 'description',
          label: 'Project Description',
          type: 'textarea',
          placeholder: 'Enter detailed project description',
          rows: 4
        },
        {
          name: 'notes',
          label: 'Additional Notes',
          type: 'textarea',
          placeholder: 'Any additional information or special instructions',
          rows: 3
        }
      ],
      columns: 1
    }
  ]
})

export const getSiteVisitFormConfig = (leads: any[] = [], employees: any[] = []): FormConfig => ({
  title: 'Schedule Site Visit',
  subtitle: 'Plan a customer site assessment',
  module: 'sitevisits',
  maxWidth: '4xl',
  submitLabel: 'Schedule Visit',
  sections: [
    {
      title: 'Visit Information',
      fields: [
        {
          name: 'consultation_request_id',
          label: 'Lead/Customer',
          type: 'select',
          required: true,
          options: leads.map(l => ({ value: l.id, label: `${l.name} - ${l.service_type}` }))
        },
        {
          name: 'visit_type',
          label: 'Visit Type',
          type: 'select',
          required: true,
          options: VISIT_TYPE_OPTIONS,
          showBadges: true
        },
        {
          name: 'assigned_technician_id',
          label: 'Assigned Technician',
          type: 'select',
          required: true,
          options: employees.filter(e => e.role === 'technician' || e.role === 'employee').map(e => ({ value: e.id, label: e.full_name }))
        }
      ],
      columns: 3
    },
    {
      title: 'Schedule',
      fields: [
        {
          name: 'scheduled_date',
          label: 'Visit Date',
          type: 'date',
          required: true
        },
        {
          name: 'scheduled_time',
          label: 'Visit Time',
          type: 'time',
          required: true
        },
        {
          name: 'estimated_duration',
          label: 'Estimated Duration (hours)',
          type: 'number',
          min: 0.5,
          step: 0.5,
          placeholder: 'e.g., 2'
        }
      ],
      columns: 3
    },
    {
      title: 'Visit Details',
      fields: [
        {
          name: 'purpose',
          label: 'Visit Purpose',
          type: 'textarea',
          required: true,
          placeholder: 'Describe the purpose of this site visit',
          rows: 3
        },
        {
          name: 'special_instructions',
          label: 'Special Instructions',
          type: 'textarea',
          placeholder: 'Any special instructions for the technician',
          rows: 2
        }
      ],
      columns: 1
    }
  ]
})

export const getInstallationFormConfig = (projects: any[] = [], employees: any[] = []): FormConfig => ({
  title: 'Create Installation',
  subtitle: 'Schedule and manage equipment installation',
  module: 'installations',
  maxWidth: '4xl',
  submitLabel: 'Create Installation',
  sections: [
    {
      title: 'Installation Information',
      fields: [
        {
          name: 'project_id',
          label: 'Project',
          type: 'select',
          required: true,
          options: projects.map(p => ({ value: p.id, label: `${p.project_name} - ${p.project_number}` }))
        },
        {
          name: 'installation_type',
          label: 'Installation Type',
          type: 'select',
          required: true,
          options: SERVICE_TYPE_OPTIONS,
          showBadges: true
        },
        {
          name: 'priority',
          label: 'Priority',
          type: 'select',
          required: true,
          options: PRIORITY_OPTIONS,
          showBadges: true
        }
      ],
      columns: 3
    },
    {
      title: 'Schedule & Team',
      fields: [
        {
          name: 'scheduled_date',
          label: 'Installation Date',
          type: 'date',
          required: true
        },
        {
          name: 'estimated_duration',
          label: 'Estimated Duration (days)',
          type: 'number',
          min: 1,
          required: true
        },
        {
          name: 'lead_technician_id',
          label: 'Lead Technician',
          type: 'select',
          required: true,
          options: employees.filter(e => e.role === 'technician' || e.role === 'employee').map(e => ({ value: e.id, label: e.full_name }))
        }
      ],
      columns: 3
    },
    {
      title: 'Equipment & Requirements',
      fields: [
        {
          name: 'equipment_details',
          label: 'Equipment Details',
          type: 'textarea',
          required: true,
          placeholder: 'List the equipment to be installed',
          rows: 3
        },
        {
          name: 'special_requirements',
          label: 'Special Requirements',
          type: 'textarea',
          placeholder: 'Any special installation requirements or considerations',
          rows: 2
        }
      ],
      columns: 1
    }
  ]
})

export const getAMCFormConfig = (customers: any[] = [], employees: any[] = []): FormConfig => ({
  title: 'Create AMC Contract',
  subtitle: 'Set up Annual Maintenance Contract',
  module: 'amc',
  maxWidth: '4xl',
  submitLabel: 'Create Contract',
  sections: [
    {
      title: 'Contract Information',
      fields: [
        {
          name: 'customer_id',
          label: 'Customer',
          type: 'select',
          required: true,
          options: customers.map(c => ({ value: c.id, label: c.name }))
        },
        {
          name: 'contract_type',
          label: 'Contract Type',
          type: 'select',
          required: true,
          options: [
            { value: 'comprehensive', label: 'Comprehensive', color: 'bg-green-100 text-green-800' },
            { value: 'preventive', label: 'Preventive', color: 'bg-blue-100 text-blue-800' },
            { value: 'breakdown', label: 'Breakdown', color: 'bg-orange-100 text-orange-800' }
          ],
          showBadges: true
        },
        {
          name: 'assigned_technician_id',
          label: 'Assigned Technician',
          type: 'select',
          required: true,
          options: employees.filter(e => e.role === 'technician' || e.role === 'employee').map(e => ({ value: e.id, label: e.full_name }))
        }
      ],
      columns: 3
    },
    {
      title: 'Contract Terms',
      fields: [
        {
          name: 'start_date',
          label: 'Start Date',
          type: 'date',
          required: true
        },
        {
          name: 'end_date',
          label: 'End Date',
          type: 'date',
          required: true
        },
        {
          name: 'service_frequency',
          label: 'Service Frequency',
          type: 'select',
          required: true,
          options: [
            { value: 'monthly', label: 'Monthly' },
            { value: 'quarterly', label: 'Quarterly' },
            { value: 'half_yearly', label: 'Half Yearly' },
            { value: 'yearly', label: 'Yearly' }
          ]
        },
        {
          name: 'contract_value',
          label: 'Contract Value',
          type: 'currency',
          currency: 'INR',
          required: true
        }
      ],
      columns: 2
    },
    {
      title: 'Service Details',
      fields: [
        {
          name: 'equipment_covered',
          label: 'Equipment Covered',
          type: 'textarea',
          required: true,
          placeholder: 'List all equipment covered under this AMC',
          rows: 3
        },
        {
          name: 'service_scope',
          label: 'Service Scope',
          type: 'textarea',
          required: true,
          placeholder: 'Describe the scope of services included',
          rows: 3
        },
        {
          name: 'terms_conditions',
          label: 'Terms & Conditions',
          type: 'textarea',
          placeholder: 'Additional terms and conditions',
          rows: 2
        }
      ],
      columns: 1
    }
  ]
})

export const getInvoiceFormConfig = (projects: any[] = [], customers: any[] = []): FormConfig => ({
  title: 'Create Invoice',
  subtitle: 'Generate customer invoice with detailed billing',
  module: 'invoices',
  maxWidth: '5xl',
  submitLabel: 'Create Invoice',
  sections: [
    {
      title: 'Invoice Details',
      fields: [
        {
          name: 'invoice_number',
          label: 'Invoice Number',
          type: 'text',
          placeholder: 'Auto-generated if left blank'
        },
        {
          name: 'project_id',
          label: 'Project',
          type: 'select',
          required: true,
          options: projects.map(p => ({ value: p.id, label: `${p.project_name} - ${p.project_number}` }))
        },
        {
          name: 'customer_id',
          label: 'Customer',
          type: 'select',
          required: true,
          options: customers.map(c => ({ value: c.id, label: c.name }))
        },
        {
          name: 'invoice_type',
          label: 'Invoice Type',
          type: 'select',
          required: true,
          options: [
            { value: 'advance', label: 'Advance Payment' },
            { value: 'progress', label: 'Progress Payment' },
            { value: 'final', label: 'Final Payment' },
            { value: 'amc', label: 'AMC Invoice' }
          ]
        },
        {
          name: 'invoice_date',
          label: 'Invoice Date',
          type: 'date',
          required: true
        },
        {
          name: 'due_date',
          label: 'Due Date',
          type: 'date',
          required: true
        },
        {
          name: 'payment_terms',
          label: 'Payment Terms',
          type: 'select',
          required: true,
          options: [
            { value: 'Net 15 days', label: 'Net 15 days' },
            { value: 'Net 30 days', label: 'Net 30 days' },
            { value: 'Net 60 days', label: 'Net 60 days' },
            { value: 'Due on Receipt', label: 'Due on Receipt' },
            { value: 'Custom', label: 'Custom Terms' }
          ]
        },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          required: true,
          options: STATUS_OPTIONS.invoices
        }
      ],
      columns: 2
    },
    {
      title: 'Items & Services',
      fields: [
        {
          name: 'items',
          label: 'Invoice Items',
          type: 'line-items',
          required: true
        }
      ],
      columns: 1
    },
    {
      title: 'Calculated Totals',
      fields: [
        {
          name: 'subtotal',
          label: 'Subtotal Amount',
          type: 'currency',
          currency: 'INR'
        },
        {
          name: 'discount_percentage',
          label: 'Discount (%)',
          type: 'number',
          min: 0,
          max: 100
        },
        {
          name: 'discount_amount',
          label: 'Discount Amount',
          type: 'currency',
          currency: 'INR'
        },
        {
          name: 'tax_rate',
          label: 'Tax Rate (%)',
          type: 'number',
          min: 0,
          max: 100,
          required: true
        },
        {
          name: 'tax_amount',
          label: 'Tax Amount',
          type: 'currency',
          currency: 'INR'
        },
        {
          name: 'total_amount',
          label: 'Total Amount',
          type: 'currency',
          currency: 'INR'
        }
      ],
      columns: 2
    },
    {
      title: 'Additional Information',
      fields: [
        {
          name: 'description',
          label: 'Invoice Description',
          type: 'textarea',
          placeholder: 'Describe the services or products being invoiced',
          rows: 3
        },
        {
          name: 'notes',
          label: 'Notes & Payment Instructions',
          type: 'textarea',
          placeholder: 'Additional notes, payment instructions, or terms',
          rows: 2
        }
      ],
      columns: 1
    }
  ]
})

export const getPaymentFormConfig = (invoices: any[] = []): FormConfig => ({
  title: 'Record Payment',
  subtitle: 'Track customer payment',
  module: 'payments',
  maxWidth: '4xl',
  submitLabel: 'Record Payment',
  sections: [
    {
      title: 'Payment Information',
      fields: [
        {
          name: 'invoice_id',
          label: 'Invoice',
          type: 'select',
          required: true,
          options: invoices.map(i => ({ value: i.id, label: `${i.invoice_number} - ${i.customer?.name}` }))
        },
        {
          name: 'payment_method',
          label: 'Payment Method',
          type: 'select',
          required: true,
          options: PAYMENT_METHOD_OPTIONS,
          showBadges: true
        },
        {
          name: 'amount',
          label: 'Payment Amount',
          type: 'currency',
          currency: 'INR',
          required: true
        },
        {
          name: 'payment_date',
          label: 'Payment Date',
          type: 'date',
          required: true
        }
      ],
      columns: 2
    },
    {
      title: 'Transaction Details',
      fields: [
        {
          name: 'transaction_id',
          label: 'Transaction ID',
          type: 'text',
          placeholder: 'Enter transaction/reference ID'
        },
        {
          name: 'status',
          label: 'Payment Status',
          type: 'select',
          required: true,
          options: STATUS_OPTIONS.payments,
          showBadges: true
        }
      ],
      columns: 2
    },
    {
      title: 'Additional Information',
      fields: [
        {
          name: 'notes',
          label: 'Payment Notes',
          type: 'textarea',
          placeholder: 'Any additional notes about this payment',
          rows: 3
        }
      ],
      columns: 1
    }
  ]
})

export const getQuotationFormConfig = (customers: any[] = [], projects: any[] = [], consultationRequests: any[] = []): FormConfig => ({
  title: 'Create Quotation',
  subtitle: 'Generate comprehensive customer quotation linked to a project',
  module: 'quotations',
  maxWidth: '5xl',
  submitLabel: 'Create Quotation',
  sections: [
    {
      title: 'Customer Information',
      fields: [
        {
          name: 'customer_type',
          label: 'Customer Type',
          type: 'select',
          required: true,
          options: [
            { value: 'consultation', label: 'From Consultation Request' },
            { value: 'existing', label: 'Existing Customer' },
            { value: 'new', label: 'New Customer' }
          ]
        },
        {
          name: 'consultation_request_id',
          label: 'Consultation Request',
          type: 'select',
          options: consultationRequests.map(cr => ({ value: cr.id, label: `${cr.name} - ${cr.service_type}` })),
          placeholder: 'Select consultation request',
          showWhen: (formData: any) => formData.customer_type === 'consultation'
        },
        {
          name: 'customer_id',
          label: 'Customer',
          type: 'select',
          required: true,
          options: customers.map(c => ({ value: c.id, label: `${c.name} - ${c.phone}` })),
          placeholder: 'Select customer',
          showWhen: (formData: any) => formData.customer_type === 'existing'
        },
        {
          name: 'project_id',
          label: 'Project (Required)',
          type: 'select',
          required: true,
          options: projects.map(p => ({ value: p.id, label: `${p.project_number} - ${p.project_name}` })),
          placeholder: 'Select project for this quotation'
        }
      ],
      columns: 1
    },
    {
      title: 'New Customer Details',
      fields: [
        {
          name: 'customer_name',
          label: 'Customer Name',
          type: 'text',
          required: true,
          showWhen: (formData: any) => formData.customer_type === 'new' || formData.customer_type === 'consultation'
        },
        {
          name: 'customer_phone',
          label: 'Phone',
          type: 'tel',
          required: true,
          showWhen: (formData: any) => formData.customer_type === 'new' || formData.customer_type === 'consultation'
        },
        {
          name: 'customer_email',
          label: 'Email',
          type: 'email',
          required: true,
          showWhen: (formData: any) => formData.customer_type === 'new' || formData.customer_type === 'consultation'
        },
        {
          name: 'customer_address',
          label: 'Address',
          type: 'text',
          required: true,
          showWhen: (formData: any) => formData.customer_type === 'new' || formData.customer_type === 'consultation'
        }
      ],
      columns: 2,
      showWhen: (formData: any) => formData.customer_type === 'new' || formData.customer_type === 'consultation'
    },
    {
      title: 'Quotation Details',
      fields: [
        {
          name: 'quote_number',
          label: 'Quotation Number',
          type: 'text',
          required: true,
          placeholder: 'Auto-generated if empty'
        },
        {
          name: 'valid_until',
          label: 'Valid Until',
          type: 'date',
          required: true,
          placeholder: 'Quotation expiry date'
        },
        {
          name: 'quote_title',
          label: 'Title',
          type: 'text',
          required: true,
          placeholder: 'e.g., AC Installation and Maintenance Quote'
        },
        {
          name: 'description',
          label: 'Description',
          type: 'textarea',
          placeholder: 'Brief description of the work to be done',
          rows: 3
        }
      ],
      columns: 2
    },
    {
      title: 'Tax & Discount Settings',
      fields: [
        {
          name: 'tax_rate',
          label: 'Tax/GST Rate (%)',
          type: 'number',
          required: true,
          step: 0.01,
          min: 0,
          max: 100,
          placeholder: '18.00'
        },
        {
          name: 'discount_percentage',
          label: 'Discount (%)',
          type: 'number',
          step: 0.01,
          min: 0,
          max: 100,
          placeholder: '0'
        }
      ],
      columns: 2
    },
    {
      title: 'Items & Services',
      fields: [
        {
          name: 'items',
          label: 'Quotation Items',
          type: 'line-items',
          required: true
        }
      ],
      columns: 1
    },
    {
      title: 'Calculated Totals',
      fields: [
        {
          name: 'subtotal',
          label: 'Subtotal Amount',
          type: 'currency',
          currency: 'INR',
          disabled: true,
          placeholder: 'Auto-calculated from items'
        },
        {
          name: 'discount_amount',
          label: 'Discount Amount',
          type: 'currency',
          currency: 'INR',
          disabled: true,
          placeholder: 'Auto-calculated discount amount'
        },
        {
          name: 'tax_amount',
          label: 'Tax Amount',
          type: 'currency',
          currency: 'INR',
          disabled: true,
          placeholder: 'Auto-calculated tax amount'
        },
        {
          name: 'total_amount',
          label: 'Total Amount',
          type: 'currency',
          currency: 'INR',
          disabled: true,
          placeholder: 'Final total amount'
        }
      ],
      columns: 2
    },
    {
      title: 'Terms & Additional Information',
      fields: [
        {
          name: 'terms_and_conditions',
          label: 'Terms & Conditions',
          type: 'textarea',
          required: true,
          placeholder: `1. All prices are in Indian Rupees (INR)
2. Installation will be completed within 7-10 working days from confirmation
3. 1 year comprehensive warranty on all equipment
4. Payment terms: 50% advance, 50% on completion
5. GST will be added as applicable
6. This quotation is valid for 30 days from the date of issue`,
          rows: 6
        },
        {
          name: 'notes',
          label: 'Additional Notes',
          type: 'textarea',
          placeholder: 'Any additional notes, clarifications, or special instructions',
          rows: 3
        }
      ],
      columns: 1
    }
  ]
})

// Form validation helpers
export const validateFormData = (formData: any, config: FormConfig): Record<string, string> => {
  const errors: Record<string, string> = {}

  config.sections.forEach(section => {
    section.fields.forEach(field => {
      const value = formData[field.name]
      
      if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
        errors[field.name] = `${field.label} is required`
      }

      if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors[field.name] = 'Invalid email format'
      }

      if (field.type === 'tel' && value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/\s/g, ''))) {
        errors[field.name] = 'Invalid phone format'
      }

      if (field.validation && value) {
        const validationError = field.validation(value)
        if (validationError) {
          errors[field.name] = validationError
        }
      }
    })
  })

  // Special validation for quotations
  if (config.module === 'quotations') {
    // Ensure project is always selected
    if (!formData.project_id) {
      errors.project_id = 'Project is required for all quotations'
    }
    
    // Validate customer information based on customer type
    if (formData.customer_type === 'existing' && !formData.customer_id) {
      errors.customer_id = 'Customer selection is required'
    }
    
    if (formData.customer_type === 'consultation' && !formData.consultation_request_id) {
      errors.consultation_request_id = 'Consultation request selection is required'
    }
    
    if ((formData.customer_type === 'new' || formData.customer_type === 'consultation')) {
      if (!formData.customer_name?.trim()) {
        errors.customer_name = 'Customer name is required'
      }
      if (!formData.customer_email?.trim()) {
        errors.customer_email = 'Customer email is required'
      }
      if (!formData.customer_phone?.trim()) {
        errors.customer_phone = 'Customer phone is required'
      }
      if (!formData.customer_address?.trim()) {
        errors.customer_address = 'Customer address is required'
      }
    }
    
    // Validate line items
    if (!formData.items || !Array.isArray(formData.items) || formData.items.length === 0) {
      errors.items = 'At least one item is required'
    } else {
      // Validate each item has required fields
      const hasInvalidItems = formData.items.some((item: any) => 
        !item.description?.trim() || item.quantity <= 0 || item.unit_price <= 0
      )
      if (hasInvalidItems) {
        errors.items = 'All items must have description, quantity > 0, and unit price > 0'
      }
    }
  }

  return errors
}

// Default form data generators
export const getDefaultFormData = (config: FormConfig): any => {
  const defaultData: any = {}

  config.sections.forEach(section => {
    section.fields.forEach(field => {
      switch (field.type) {
        case 'select':
          // Special handling for customer_type field
          if (field.name === 'customer_type') {
            defaultData[field.name] = 'consultation'
          } else {
            defaultData[field.name] = field.options?.[0]?.value || ''
          }
          break
        case 'number':
        case 'currency':
          // Set default values for specific fields
          if (field.name === 'tax_rate') {
            defaultData[field.name] = 18
          } else if (field.name === 'discount_percentage') {
            defaultData[field.name] = 0
          } else {
            defaultData[field.name] = field.min || 0
          }
          break
        case 'text':
          // Set default quote number and invoice number
          if (field.name === 'quote_number') {
            defaultData[field.name] = `QUO-${Date.now()}`
          } else if (field.name === 'invoice_number') {
            defaultData[field.name] = `INV-${Date.now()}`
          } else {
            defaultData[field.name] = ''
          }
          break
        case 'date':
          defaultData[field.name] = new Date().toISOString().split('T')[0]
          break
        case 'time':
          defaultData[field.name] = '09:00'
          break
        case 'line-items':
          defaultData[field.name] = [
            {
              id: '1',
              description: '',
              quantity: 1,
              unit_price: 0,
              total: 0
            }
          ]
          break
        default:
          defaultData[field.name] = ''
      }
    })
  })

  return defaultData
}
