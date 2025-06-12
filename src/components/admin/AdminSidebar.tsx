'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Home, 
  Users, 
  UserPlus,
  ClipboardList,
  Calendar,
  FileText,
  Wrench,
  DollarSign,
  CreditCard,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react'

interface AdminSidebarProps {
  employee: any
}

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
  { name: 'Leads', href: '/admin/leads', icon: Users },
  { name: 'Employees', href: '/admin/employees', icon: UserPlus },
  { name: 'Site Visits', href: '/admin/site-visits', icon: Calendar },
  { name: 'Quotations', href: '/admin/quotations', icon: FileText },
  { name: 'Projects', href: '/admin/projects', icon: ClipboardList },
  { name: 'Installations', href: '/admin/installations', icon: Wrench },
  { name: 'Invoicing', href: '/admin/invoicing', icon: DollarSign },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  { name: 'AMC Contracts', href: '/admin/amc', icon: ClipboardList },
  { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminSidebar({ employee }: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <>
      {/* Mobile menu overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden bg-gray-600 bg-opacity-75"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 transition-transform duration-300 ease-in-out lg:static lg:inset-0`}>
        
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-cyan-500 to-blue-600">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-cyan-600 font-bold text-lg">SE</span>
            </div>
            <span className="ml-3 text-white font-bold text-xl">SE Aircon</span>
          </div>
          
          {/* Mobile close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-white hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Employee info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium text-sm">
                {employee?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{employee?.full_name}</p>
              <p className="text-xs text-gray-500 capitalize">{employee?.role} • {employee?.department}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="group flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <item.icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="group flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-white p-2 rounded-lg shadow-lg text-gray-600 hover:text-gray-900"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </>
  )
}
