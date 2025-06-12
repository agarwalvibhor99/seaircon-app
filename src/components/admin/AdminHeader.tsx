'use client'

import { Bell, Search } from 'lucide-react'

interface AdminHeaderProps {
  employee: any
}

export default function AdminHeader({ employee }: AdminHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 lg:ml-64">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="search"
                placeholder="Search customers, projects, invoices..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500">
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
            </button>
            
            {/* User menu */}
            <div className="flex items-center">
              <div className="text-right mr-3">
                <p className="text-sm font-medium text-gray-900">{employee?.full_name}</p>
                <p className="text-xs text-gray-500">{employee?.role}</p>
              </div>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium text-sm">
                  {employee?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
