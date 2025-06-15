'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Search, 
  UserPlus, 
  Mail, 
  Phone, 
  Calendar, 
  Building,
  Eye,
  Edit,
  Trash2,
  X,
  Plus
} from 'lucide-react'
import { useEmployeeFormManager } from '@/components/ui/unified-form-manager'
import { FloatingActionButton } from '@/components/ui/floating-action-button'
import { createBrowserClient } from '@supabase/ssr'
import { notify } from '@/lib/toast'
import { formatDistanceToNow } from 'date-fns'

interface Employee {
  id: string
  full_name: string
  email: string
  phone: string
  address?: string
  department: string
  role: string
  designation: string
  hire_date: string
  salary?: number
  employee_id?: string
  status: string
  created_at: string
  updated_at: string
}

interface UnifiedEmployeeListProps {
  employees: Employee[]
}

export default function UnifiedEmployeeList({ employees }: UnifiedEmployeeListProps) {
  const [filteredEmployees, setFilteredEmployees] = useState(employees)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Modal states
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Use unified form manager for employee creation
  const {
    openCreateModal,
    FormModal: CreateFormModal
  } = useEmployeeFormManager(() => {
    // Refresh the page after successful creation
    window.location.reload()
  })

  // Edit form manager - create a new instance for editing
  const [editFormConfig, setEditFormConfig] = useState<any>(null)

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowEditDialog(true)
  }

  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowViewDialog(true)
  }

  const handleDelete = async (employeeId: string) => {
    if (!confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeId)

      if (error) throw error

      notify.success('Employee deleted successfully')
      window.location.reload()
    } catch (error) {
      console.error('Error deleting employee:', error)
      notify.error('Failed to delete employee', 'Please try again')
    }
  }

  // Filter employees based on search and filters
  React.useEffect(() => {
    let filtered = employees

    if (searchTerm) {
      filtered = filtered.filter(employee =>
        employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.phone.includes(searchTerm) ||
        employee.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (departmentFilter !== 'all') {
      filtered = filtered.filter(employee => employee.department === departmentFilter)
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(employee => employee.role === roleFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(employee => employee.status === statusFilter)
    }

    setFilteredEmployees(filtered)
  }, [employees, searchTerm, departmentFilter, roleFilter, statusFilter])

  const getDepartmentBadge = (department: string) => {
    const departmentConfig = {
      management: { label: 'Management', color: 'bg-gray-100 text-gray-800' },
      sales: { label: 'Sales', color: 'bg-gray-200 text-gray-700' },
      technical: { label: 'Technical', color: 'bg-gray-300 text-gray-800' },
      operations: { label: 'Operations', color: 'bg-gray-200 text-gray-700' },
      accounts: { label: 'Accounts', color: 'bg-gray-300 text-gray-800' }
    }
    return departmentConfig[department as keyof typeof departmentConfig] || { label: department, color: 'bg-gray-100 text-gray-800' }
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: 'Admin', color: 'bg-gray-400 text-gray-900' },
      manager: { label: 'Manager', color: 'bg-gray-200 text-gray-700' },
      employee: { label: 'Employee', color: 'bg-gray-100 text-gray-800' },
      technician: { label: 'Technician', color: 'bg-gray-300 text-gray-800' }
    }
    return roleConfig[role as keyof typeof roleConfig] || { label: role, color: 'bg-gray-100 text-gray-800' }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Active', color: 'bg-gray-100 text-gray-800' },
      inactive: { label: 'Inactive', color: 'bg-gray-400 text-gray-900' },
      on_leave: { label: 'On Leave', color: 'bg-gray-300 text-gray-800' }
    }
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.active
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Employee Management</h2>
          <p className="text-gray-600">Manage your team members and their information</p>
        </div>
        <Button onClick={openCreateModal} className="bg-gray-900 hover:bg-gray-800 text-white">
          <UserPlus className="h-4 w-4 mr-2" />
          Add New Employee
        </Button>
      </div>

      {/* Filters */}
      <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, role, department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 border-white/30"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-40 bg-white/50 border-white/30">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="accounts">Accounts</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40 bg-white/50 border-white/30">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="technician">Technician</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-white/50 border-white/30">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
              {(searchTerm || departmentFilter !== 'all' || roleFilter !== 'all' || statusFilter !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('')
                    setDepartmentFilter('all')
                    setRoleFilter('all')
                    setStatusFilter('all')
                  }}
                  className="bg-white/50 border-white/30"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee List */}
      <div className="grid gap-4">
        {filteredEmployees.length === 0 ? (
          <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <UserPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
              <p className="text-gray-500">
                {employees.length === 0 
                  ? "No employees have been added yet."
                  : "No employees match your current filters."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredEmployees.map((employee) => {
            const departmentBadge = getDepartmentBadge(employee.department)
            const roleBadge = getRoleBadge(employee.role)
            const statusBadge = getStatusBadge(employee.status)
            
            return (
              <Card key={employee.id} className="border-0 shadow-lg bg-white/95 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{employee.full_name}</h3>
                        <Badge className={statusBadge.color}>{statusBadge.label}</Badge>
                        <Badge className={roleBadge.color}>{roleBadge.label}</Badge>
                        <Badge className={departmentBadge.color}>{departmentBadge.label}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{employee.email}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{employee.phone}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span>{employee.designation}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>Joined: {formatDate(employee.hire_date)}</span>
                        </div>
                      </div>

                      {employee.employee_id && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <span className="font-medium">Employee ID:</span>
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                            {employee.employee_id}
                          </span>
                        </div>
                      )}

                      {employee.salary && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium">Monthly Salary:</span>
                          <span className="text-lg font-semibold text-gray-600">
                            {formatCurrency(employee.salary)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => handleView(employee)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(employee)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(employee.id)}
                        className="text-gray-600 hover:bg-gray-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={openCreateModal}
        icon={<Plus className="h-6 w-6" />}
        label="Add New Employee"
        variant="monochrome"
      />

      {/* Create Employee Modal */}
      <CreateFormModal />

      {/* Edit Employee Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">Edit Employee</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEditDialog(false)}
              className="hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          {selectedEmployee && (
            <div className="pt-4">
              {/* Edit form would go here - for now showing placeholder */}
              <p className="text-gray-600">Edit form for {selectedEmployee.full_name} will be implemented with the unified form system.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Employee Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">Employee Details</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowViewDialog(false)}
              className="hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          
          {selectedEmployee && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <p className="text-sm text-gray-900">{selectedEmployee.full_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-sm text-gray-900">{selectedEmployee.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-sm text-gray-900">{selectedEmployee.phone}</p>
                    </div>
                    {selectedEmployee.address && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Address</label>
                        <p className="text-sm text-gray-900">{selectedEmployee.address}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Job Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Department</label>
                      <Badge className={getDepartmentBadge(selectedEmployee.department).color}>
                        {getDepartmentBadge(selectedEmployee.department).label}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Role</label>
                      <Badge className={getRoleBadge(selectedEmployee.role).color}>
                        {getRoleBadge(selectedEmployee.role).label}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Designation</label>
                      <p className="text-sm text-gray-900">{selectedEmployee.designation}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Hire Date</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedEmployee.hire_date)}</p>
                    </div>
                    {selectedEmployee.employee_id && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Employee ID</label>
                        <p className="text-sm text-gray-900 font-mono">{selectedEmployee.employee_id}</p>
                      </div>
                    )}
                    {selectedEmployee.salary && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Monthly Salary</label>
                        <p className="text-sm text-gray-900 font-semibold">
                          {formatCurrency(selectedEmployee.salary)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Status</h3>
                <Badge className={getStatusBadge(selectedEmployee.status).color}>
                  {getStatusBadge(selectedEmployee.status).label}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
