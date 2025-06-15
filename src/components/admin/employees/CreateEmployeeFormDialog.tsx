'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Save, User, Mail, Phone, Building, Shield, Calendar, DollarSign, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { notify } from "@/lib/toast"

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
  password?: string
}

interface CreateEmployeeFormDialogProps {
  onSuccess?: () => void
  onCancel?: () => void
  employee?: any // For editing existing employee
  isEditing?: boolean
}

export default function CreateEmployeeFormDialog({ 
  onSuccess, 
  onCancel, 
  employee = null,
  isEditing = false
}: CreateEmployeeFormDialogProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState<EmployeeFormData>({
    email: employee?.email || '',
    full_name: employee?.full_name || '',
    role: employee?.role || 'employee',
    department: employee?.department || 'technical',
    phone: employee?.phone || '',
    salary: employee?.salary?.toString() || '',
    hire_date: employee?.hire_date || new Date().toISOString().split('T')[0],
    address: employee?.address || '',
    emergency_contact_name: employee?.emergency_contact_name || '',
    emergency_contact_phone: employee?.emergency_contact_phone || '',
    emergency_contact_relationship: employee?.emergency_contact_relationship || '',
    skills: employee?.skills || '',
    status: employee?.status || 'active',
    password: ''
  })

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Invalid phone format'
    }

    if (!isEditing && !formData.password) {
      newErrors.password = 'Password is required for new employees'
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (formData.salary && (isNaN(parseFloat(formData.salary)) || parseFloat(formData.salary) < 0)) {
      newErrors.salary = 'Salary must be a valid number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      notify.error('Please fix the errors and try again')
      return
    }

    setLoading(true)

    try {
      const employeeData = {
        email: formData.email,
        full_name: formData.full_name,
        role: formData.role,
        department: formData.department,
        phone: formData.phone,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        hire_date: formData.hire_date,
        address: formData.address || null,
        emergency_contact_name: formData.emergency_contact_name || null,
        emergency_contact_phone: formData.emergency_contact_phone || null,
        emergency_contact_relationship: formData.emergency_contact_relationship || null,
        skills: formData.skills || null,
        status: formData.status,
        is_active: formData.status === 'active'
      }

      if (isEditing && employee) {
        // Update existing employee
        const { error } = await supabase
          .from('employees')
          .update(employeeData)
          .eq('id', employee.id)

        if (error) throw error

        // Update password if provided
        if (formData.password) {
          const { error: authError } = await supabase.auth.admin.updateUserById(
            employee.id,
            { password: formData.password }
          )
          if (authError) {
            console.warn('Failed to update password:', authError)
            showToast.warning('Employee updated but password update failed')
          }
        }

        notify.success('Employee updated successfully!')
      } else {
        // Create new employee
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: formData.email,
          password: formData.password!,
          email_confirm: true
        })

        if (authError) throw authError

        // Insert employee record
        const { error: employeeError } = await supabase
          .from('employees')
          .insert([{
            ...employeeData,
            id: authData.user.id
          }])

        if (employeeError) {
          // Cleanup: delete auth user if employee creation fails
          await supabase.auth.admin.deleteUser(authData.user.id)
          throw employeeError
        }

        notify.success('Employee created successfully!')
      }

      onSuccess?.()
    } catch (error) {
      console.error('Error saving employee:', error)
      notify.error(
        isEditing ? 'Failed to update employee' : 'Failed to create employee', 
        'Please check the form and try again'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof EmployeeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const ROLES = [
    { value: 'admin', label: 'Administrator', color: 'bg-gray-100 text-gray-800' },
    { value: 'manager', label: 'Manager', color: 'bg-gray-200 text-gray-800' },
    { value: 'team_lead', label: 'Team Lead', color: 'bg-gray-300 text-gray-800' },
    { value: 'employee', label: 'Employee', color: 'bg-gray-400 text-gray-800' },
    { value: 'technician', label: 'Technician', color: 'bg-gray-500 text-white' },
    { value: 'engineer', label: 'Engineer', color: 'bg-gray-600 text-white' }
  ]

  const DEPARTMENTS = [
    { value: 'management', label: 'Management', color: 'bg-gray-100 text-gray-800' },
    { value: 'sales', label: 'Sales', color: 'bg-gray-200 text-gray-800' },
    { value: 'technical', label: 'Technical', color: 'bg-gray-300 text-gray-800' },
    { value: 'operations', label: 'Operations', color: 'bg-gray-400 text-gray-800' },
    { value: 'accounts', label: 'Accounts', color: 'bg-gray-500 text-white' },
    { value: 'hr', label: 'Human Resources', color: 'bg-gray-600 text-white' }
  ]

  const STATUS_OPTIONS = [
    { value: 'active', label: 'Active', color: 'bg-gray-100 text-gray-800' },
    { value: 'inactive', label: 'Inactive', color: 'bg-gray-400 text-gray-800' },
    { value: 'on_leave', label: 'On Leave', color: 'bg-gray-300 text-gray-800' }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-t-lg">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder="Enter full name"
                className={errors.full_name ? 'border-red-500' : ''}
              />
              {errors.full_name && <p className="text-sm text-red-500 mt-1">{errors.full_name}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="employee@seaircon.com"
                className={errors.email ? 'border-red-500' : ''}
                disabled={isEditing} // Don't allow email changes for existing employees
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+91 9876543210"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <Label htmlFor="hire_date">Hire Date</Label>
              <Input
                id="hire_date"
                type="date"
                value={formData.hire_date}
                onChange={(e) => handleInputChange('hire_date', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Complete address"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Role & Department */}
      <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role & Department
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {ROLES.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center gap-2">
                        <Badge className={role.color}>{role.label}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {DEPARTMENTS.map(dept => (
                    <SelectItem key={dept.value} value={dept.value}>
                      <div className="flex items-center gap-2">
                        <Badge className={dept.color}>{dept.label}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value as 'active' | 'inactive' | 'on_leave')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {STATUS_OPTIONS.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center gap-2">
                        <Badge className={status.color}>{status.label}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compensation & Skills */}
      <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Compensation & Skills
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label htmlFor="salary">Salary (₹/month)</Label>
            <Input
              id="salary"
              type="number"
              value={formData.salary}
              onChange={(e) => handleInputChange('salary', e.target.value)}
              placeholder="0"
              min="0"
              step="1000"
              className={errors.salary ? 'border-red-500' : ''}
            />
            {errors.salary && <p className="text-sm text-red-500 mt-1">{errors.salary}</p>}
          </div>

          <div>
            <Label htmlFor="skills">Skills & Expertise</Label>
            <Textarea
              id="skills"
              value={formData.skills}
              onChange={(e) => handleInputChange('skills', e.target.value)}
              placeholder="List relevant skills, certifications, and expertise"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Emergency Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="emergency_contact_name">Contact Name</Label>
              <Input
                id="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                placeholder="Emergency contact name"
              />
            </div>

            <div>
              <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
              <Input
                id="emergency_contact_phone"
                value={formData.emergency_contact_phone}
                onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <Label htmlFor="emergency_contact_relationship">Relationship</Label>
              <Input
                id="emergency_contact_relationship"
                value={formData.emergency_contact_relationship}
                onChange={(e) => handleInputChange('emergency_contact_relationship', e.target.value)}
                placeholder="e.g., Spouse, Parent, Sibling"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      {(!isEditing || formData.password) && (
        <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {isEditing ? 'Change Password' : 'Account Security'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="password">
                {isEditing ? 'New Password (leave blank to keep current)' : 'Password *'}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder={isEditing ? 'Enter new password' : 'Enter password'}
                  className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
              {!isEditing && (
                <p className="text-sm text-gray-500 mt-1">
                  Password must be at least 6 characters long
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
          className="bg-gray-900 hover:bg-gray-800 text-white"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Update Employee' : 'Create Employee'}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
