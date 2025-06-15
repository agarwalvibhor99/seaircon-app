'use client'

import StandardizedStats from '@/components/ui/standardized-stats'
import { Users, UserCheck, UserX, Shield, Clock } from 'lucide-react'

interface Employee {
  is_active: boolean
  role: 'admin' | 'manager' | 'technician' | 'sales_rep'
  created_at: string
}

interface EmployeesStatsProps {
  employees: Employee[]
}

export default function EmployeesStats({ employees }: EmployeesStatsProps) {
  const today = new Date()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(today.getDate() - 30)

  const stats = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter(e => e.is_active).length,
    inactiveEmployees: employees.filter(e => !e.is_active).length,
    admins: employees.filter(e => e.role === 'admin' && e.is_active).length,
    managers: employees.filter(e => e.role === 'manager' && e.is_active).length,
    technicians: employees.filter(e => e.role === 'technician' && e.is_active).length,
    salesReps: employees.filter(e => e.role === 'sales_rep' && e.is_active).length,
    recentHires: employees.filter(e => {
      const hireDate = new Date(e.created_at)
      return hireDate >= thirtyDaysAgo && e.is_active
    }).length
  }

  const statCards = [
    { 
      title: 'Total Employees', 
      value: stats.totalEmployees, 
      icon: Users, 
      color: 'text-blue-600' 
    },
    { 
      title: 'Active', 
      value: stats.activeEmployees, 
      subtitle: `${stats.inactiveEmployees} inactive`,
      icon: UserCheck, 
      color: 'text-green-600' 
    },
    { 
      title: 'Admins & Managers', 
      value: stats.admins + stats.managers, 
      subtitle: `${stats.admins} admins, ${stats.managers} managers`,
      icon: Shield, 
      color: 'text-purple-600' 
    },
    { 
      title: 'Technicians', 
      value: stats.technicians, 
      subtitle: 'Field staff',
      icon: UserX, 
      color: 'text-orange-600' 
    },
    { 
      title: 'Recent Hires', 
      value: stats.recentHires, 
      subtitle: 'Last 30 days',
      icon: Clock, 
      color: 'text-cyan-600' 
    }
  ]

  return <StandardizedStats stats={statCards} columns={5} />
}
