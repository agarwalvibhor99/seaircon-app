'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Settings, 
  ShieldCheck, 
  Bell,
  Users,
  Key,
  Mail,
  Phone
} from 'lucide-react'

interface Employee {
  id: string
  full_name: string
  email: string
  phone?: string
  role: 'admin' | 'manager' | 'technician' | 'sales'
  department: string
  is_active: boolean
  created_at: string
}

interface SettingsOverviewProps {
  currentEmployee: Employee
  employees: Employee[]
}

export default function SettingsOverview({ currentEmployee, employees }: SettingsOverviewProps) {
  const [activeTab, setActiveTab] = useState('profile')
  
  const [profileData, setProfileData] = useState({
    full_name: currentEmployee?.full_name || '',
    email: currentEmployee?.email || '',
    phone: currentEmployee?.phone || '',
    department: currentEmployee?.department || ''
  })

  const [systemSettings, setSystemSettings] = useState({
    companyName: 'SE Aircon',
    companyEmail: 'info@seaircon.com',
    companyPhone: '+91 9876543210',
    companyAddress: 'Mumbai, Maharashtra, India',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    taxRate: '18'
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    leadAlerts: true,
    invoiceReminders: true,
    systemUpdates: false
  })

  const handleProfileUpdate = () => {
    // Handle profile update
    console.log('Profile updated:', profileData)
  }

  const handleSystemUpdate = () => {
    // Handle system settings update
    console.log('System settings updated:', systemSettings)
  }

  const roleColors = {
    admin: 'bg-red-100 text-red-800',
    manager: 'bg-blue-100 text-blue-800',
    technician: 'bg-green-100 text-green-800',
    sales: 'bg-purple-100 text-purple-800'
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select value={profileData.department} onValueChange={(value) => setProfileData(prev => ({ ...prev, department: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="admin">Administration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center gap-4 pt-4">
                <div>
                  <Label>Current Role</Label>
                  <div className="mt-1">
                    <Badge className={roleColors[currentEmployee?.role]}>
                      {currentEmployee?.role?.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    <Badge className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleProfileUpdate}>
                  Update Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
                <Button>Add User</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium text-sm">
                          {employee.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium">{employee.full_name}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          {employee.email}
                        </div>
                        {employee.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            {employee.phone}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={roleColors[employee.role]}>
                        {employee.role}
                      </Badge>
                      <Badge className="bg-gray-100 text-gray-800">
                        {employee.department}
                      </Badge>
                      <Badge className={employee.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {employee.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={systemSettings.companyName}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, companyName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="companyEmail">Company Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={systemSettings.companyEmail}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, companyEmail: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="companyPhone">Company Phone</Label>
                  <Input
                    id="companyPhone"
                    value={systemSettings.companyPhone}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, companyPhone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={systemSettings.timezone} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, timezone: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={systemSettings.currency} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={systemSettings.taxRate}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, taxRate: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="companyAddress">Company Address</Label>
                <Input
                  id="companyAddress"
                  value={systemSettings.companyAddress}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, companyAddress: e.target.value }))}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSystemUpdate}>
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.emailNotifications}
                    onChange={(e) => setNotifications(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                    className="h-4 w-4"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.smsNotifications}
                    onChange={(e) => setNotifications(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                    className="h-4 w-4"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Lead Alerts</Label>
                    <p className="text-sm text-gray-600">Get notified about new leads</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.leadAlerts}
                    onChange={(e) => setNotifications(prev => ({ ...prev, leadAlerts: e.target.checked }))}
                    className="h-4 w-4"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Invoice Reminders</Label>
                    <p className="text-sm text-gray-600">Reminders for overdue invoices</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.invoiceReminders}
                    onChange={(e) => setNotifications(prev => ({ ...prev, invoiceReminders: e.target.checked }))}
                    className="h-4 w-4"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>System Updates</Label>
                    <p className="text-sm text-gray-600">Notifications about system updates</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.systemUpdates}
                    onChange={(e) => setNotifications(prev => ({ ...prev, systemUpdates: e.target.checked }))}
                    className="h-4 w-4"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button>
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Change Password</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <Input type="password" placeholder="Current Password" />
                    <Input type="password" placeholder="New Password" />
                  </div>
                  <div className="mt-2">
                    <Input type="password" placeholder="Confirm New Password" />
                  </div>
                  <Button className="mt-2">Update Password</Button>
                </div>

                <div className="border-t pt-4">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-600 mb-4">
                    Add an extra layer of security to your account
                  </p>
                  <Button variant="outline">
                    <Key className="h-4 w-4 mr-2" />
                    Enable 2FA
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <Label>Session Management</Label>
                  <p className="text-sm text-gray-600 mb-4">
                    Manage your active sessions across devices
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">Current Session</p>
                        <p className="text-sm text-gray-600">Chrome on MacOS - Active now</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Current</Badge>
                    </div>
                  </div>
                  <Button variant="outline" className="mt-2">
                    Logout All Sessions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
