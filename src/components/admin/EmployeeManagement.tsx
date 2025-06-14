'use client'

import React, { useState, useEffect } from 'react'
import { 
  UserPlus, 
  Search, 
  Download, 
  Edit, 
  Trash2, 
  X,
  Users,
  Mail,
  Phone,
  Building,
  Shield,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Plus
} from 'lucide-react'
import { notify } from '@/lib/toast'
import CreateEmployeeFormDialog from './employees/CreateEmployeeFormDialog'

interface Employee {
  id: string
  email: string
  full_name: string
  role: string
  department: string | null
  phone: string | null
  salary: number | null
  hire_date: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  emergency_contact_relationship: string | null
  skills: string | null
  address: string | null
  status: 'active' | 'inactive' | 'on_leave'
  is_active: boolean
  created_at: string
  updated_at: string
}

interface EmployeeFormData {
  email: string
  full_name: string
  role: string
  department: string
  phone: string
  salary: string
  hire_date: string
  address: string
  emergency_contact_name: string
  emergency_contact_phone: string
  emergency_contact_relationship: string
  skills: string
  status: 'active' | 'inactive' | 'on_leave'
}

const ROLES = [
  { value: 'admin', label: 'Administrator', color: 'bg-red-100 text-red-800' },
  { value: 'manager', label: 'Manager', color: 'bg-purple-100 text-purple-800' },
  { value: 'employee', label: 'Employee', color: 'bg-blue-100 text-blue-800' },
  { value: 'technician', label: 'Technician', color: 'bg-green-100 text-green-800' }
]

const DEPARTMENTS = [
  { value: 'management', label: 'Management', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'sales', label: 'Sales', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'technical', label: 'Technical', color: 'bg-green-100 text-green-800' },
  { value: 'operations', label: 'Operations', color: 'bg-blue-100 text-blue-800' },
  { value: 'accounts', label: 'Accounts', color: 'bg-purple-100 text-purple-800' }
]

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
  { value: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800' },
  { value: 'on_leave', label: 'On Leave', color: 'bg-orange-100 text-orange-800' }
]

// Modern Dialog Component
const Dialog = ({ isOpen, onClose, title, children }: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string;
  children: React.ReactNode 
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showInactiveEmployees, setShowInactiveEmployees] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState<EmployeeFormData>({
    email: '',
    full_name: '',
    role: 'employee',
    department: '',
    phone: '',
    salary: '',
    hire_date: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    skills: '',
    status: 'active'
  })
  const [formErrors, setFormErrors] = useState<Partial<EmployeeFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Load employees
  useEffect(() => {
    loadEmployees()
  }, [])

  // Filter employees
  useEffect(() => {
    let filtered = employees.filter(emp => {
      const matchesSearch = emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = !roleFilter || emp.role === roleFilter
      const matchesDepartment = !departmentFilter || emp.department === departmentFilter
      const matchesStatus = !statusFilter || emp.status === statusFilter
      const matchesActive = showInactiveEmployees || emp.is_active
      
      return matchesSearch && matchesRole && matchesDepartment && matchesStatus && matchesActive
    })

    setFilteredEmployees(filtered)
  }, [employees, searchTerm, roleFilter, departmentFilter, statusFilter, showInactiveEmployees])

  const loadEmployees = async () => {
    try {
      setLoading(true)
      console.log('Loading employees...')
      const response = await fetch('/api/admin/employees')
      console.log('Employee API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Employee data:', data)
        setEmployees(data.employees || [])
      } else {
        const errorData = await response.json()
        console.error('Failed to load employees:', errorData)
        notify.error('Failed to load employees', 'Please try again later')
      }
    } catch (error) {
      console.error('Error loading employees:', error)
      notify.error('Failed to load employees', 'Please try again later')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    setFormData({
      email: employee.email,
      full_name: employee.full_name,
      role: employee.role,
      department: employee.department || '',
      phone: employee.phone || '',
      salary: employee.salary?.toString() || '',
      hire_date: employee.hire_date || '',
      address: employee.address || '',
      emergency_contact_name: employee.emergency_contact_name || '',
      emergency_contact_phone: employee.emergency_contact_phone || '',
      emergency_contact_relationship: employee.emergency_contact_relationship || '',
      skills: employee.skills || '',
      status: employee.status
    })
    setIsEditDialogOpen(true)
  }

  const generatePassword = () => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    setGeneratedPassword(password)
    return password
  }

  const validateForm = (data: EmployeeFormData) => {
    const errors: Partial<EmployeeFormData> = {}
    
    if (!data.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Invalid email format'
    }
    
    if (!data.full_name.trim()) {
      errors.full_name = 'Full name is required'
    }
    
    if (!data.role) {
      errors.role = 'Role is required'
    }

    if (data.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(data.phone.replace(/\s/g, ''))) {
      errors.phone = 'Invalid phone format'
    }
    
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const errors = validateForm(formData)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setIsSubmitting(true)
    setFormErrors({})

    try {
      const password = generatePassword()
      
      const response = await fetch('/api/admin/create-employee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.full_name,
          role: formData.role,
          department: formData.department,
          phone: formData.phone,
          password
        }),
      })

      const result = await response.json()

      if (response.ok) {
        notify.success('Employee created successfully', `Password: ${password}`)
        setIsAddDialogOpen(false)
        resetForm()
        loadEmployees()
      } else {
        notify.error('Failed to create employee', result.error || 'Please try again')
      }
    } catch (error) {
      console.error('Error creating employee:', error)
      notify.error('Failed to create employee', 'Please try again later')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEmployee) return

    const errors = validateForm(formData)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setIsSubmitting(true)
    setFormErrors({})

    try {
      const response = await fetch('/api/admin/update-employee', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingEmployee.id,
          fullName: formData.full_name,
          role: formData.role,
          department: formData.department,
          phone: formData.phone,
          isActive: editingEmployee.is_active
        }),
      })

      const result = await response.json()

      if (response.ok) {
        notify.success('Employee updated successfully')
        setIsEditDialogOpen(false)
        setEditingEmployee(null)
        resetForm()
        loadEmployees()
      } else {
        notify.error('Failed to update employee', result.error || 'Please try again')
      }
    } catch (error) {
      console.error('Error updating employee:', error)
      notify.error('Failed to update employee', 'Please try again later')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleEmployeeStatus = async (employee: Employee) => {
    try {
      const response = await fetch('/api/admin/update-employee', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: employee.id,
          fullName: employee.full_name,
          role: employee.role,
          department: employee.department,
          phone: employee.phone,
          isActive: !employee.is_active
        }),
      })

      if (response.ok) {
        notify.success(`Employee ${!employee.is_active ? 'activated' : 'deactivated'} successfully`)
        loadEmployees()
      } else {
        const result = await response.json()
        notify.error('Failed to update employee status', result.error || 'Please try again')
      }
    } catch (error) {
      console.error('Error updating employee status:', error)
      notify.error('Failed to update employee status', 'Please try again later')
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      full_name: '',
      role: 'employee',
      department: '',
      phone: '',
      salary: '',
      hire_date: '',
      address: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      emergency_contact_relationship: '',
      skills: '',
      status: 'active'
    })
    setFormErrors({})
    setGeneratedPassword('')
    setShowPassword(false)
  }

  const exportEmployees = () => {
    const csv = [
      ['Name', 'Email', 'Role', 'Department', 'Phone', 'Status', 'Created'],
      ...filteredEmployees.map(emp => [
        emp.full_name,
        emp.email,
        emp.role,
        emp.department || '',
        emp.phone || '',
        emp.is_active ? 'Active' : 'Inactive',
        new Date(emp.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `employees-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'manager': return 'bg-blue-100 text-blue-800'
      case 'technician': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
        <p className="mt-2 text-gray-600">
          Manage your team members and their access permissions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-12 w-12 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {employees.filter(emp => emp.is_active).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Shield className="h-12 w-12 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Admins</p>
              <p className="text-2xl font-bold text-gray-900">
                {employees.filter(emp => emp.role === 'admin').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Building className="h-12 w-12 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Departments</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(employees.filter(emp => emp.department).map(emp => emp.department)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2">              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-40 overflow-y-auto"
                size={1}
              >
                <option value="">All Roles</option>
                {ROLES.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>

              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-40 overflow-y-auto"
                size={1}
              >
                <option value="">All Departments</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept.value} value={dept.value}>{dept.label}</option>
                ))}
              </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={showInactiveEmployees}
                  onChange={(e) => setShowInactiveEmployees(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Show inactive
              </label>
              
              <button
                onClick={exportEmployees}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              
              <button
                onClick={() => setIsAddDialogOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4" />
                Add Employee
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role & Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium text-sm">
                          {employee.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {employee.full_name}
                        </div>
                        <div className="text-sm text-gray-500">{employee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(employee.role)}`}>
                        {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
                      </span>
                      {employee.department && (
                        <span className="text-xs text-gray-500 capitalize">
                          {employee.department}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {employee.email}
                      </div>
                      {employee.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {employee.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(employee.is_active)}`}>
                      {employee.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(employee.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => startEdit(employee)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleEmployeeStatus(employee)}
                        className={`${employee.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                      >
                        {employee.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {employees.length === 0 
                ? "Get started by adding your first employee."
                : "Try adjusting your search or filter criteria."
              }
            </p>
          </div>
        )}
      </div>

      {/* Employee Form Dialog */}
      {isAddDialogOpen && (
        <CreateEmployeeFormDialog
          onSuccess={() => {
            setIsAddDialogOpen(false)
            loadEmployees()
          }}
          onCancel={() => setIsAddDialogOpen(false)}
        />
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsAddDialogOpen(true)}
          className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          title="Add New Employee"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {/* Edit Employee Dialog */}
      <Dialog 
        isOpen={isEditDialogOpen} 
        onClose={() => {
          setIsEditDialogOpen(false)
          setEditingEmployee(null)
          resetForm()
        }}
        title="Edit Employee"
      >
        {editingEmployee && (
          <form onSubmit={handleEdit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.full_name ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {formErrors.full_name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.full_name}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ maxHeight: '200px', overflowY: 'auto' }}
                >
                  {ROLES.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ maxHeight: '200px', overflowY: 'auto' }}
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept.value} value={dept.value}>{dept.label}</option>
                  ))}
                </select>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {formErrors.phone && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'on_leave' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {STATUS_OPTIONS.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setEditingEmployee(null)
                  resetForm()
                }}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Updating...' : 'Update Employee'}
              </button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  )
}
