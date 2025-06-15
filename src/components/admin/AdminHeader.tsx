'use client'

import { useState } from 'react'
import { Bell, Search, X } from 'lucide-react'

interface AdminHeaderProps {
  employee: any
}

export default function AdminHeader({ employee }: AdminHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  
  // Mock notifications - in real app, this would come from props or API
  const notifications = [
    {
      id: '1',
      title: 'New Lead Received',
      message: 'John Smith requested AC installation quote',
      time: '5 min ago',
      type: 'info',
      unread: true
    },
    {
      id: '2', 
      title: 'Payment Received',
      message: 'Invoice #INV-2025-001 has been paid',
      time: '1 hour ago',
      type: 'success',
      unread: true
    },
    {
      id: '3',
      title: 'AMC Due Soon',
      message: 'ABC Office AMC service due in 3 days',
      time: '2 hours ago',
      type: 'warning',
      unread: false
    }
  ]
  
  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
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
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button 
                className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-gray-600 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {/* Notification Dropdown */}
              {showNotifications && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowNotifications(false)}
                  />
                  
                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                              notification.unread ? 'bg-gray-50' : ''
                            }`}
                          >
                            <div className="flex items-start">
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-900">
                                  {notification.title}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {notification.time}
                                </p>
                              </div>
                              {notification.unread && (
                                <div className="w-2 h-2 bg-gray-500 rounded-full mt-2"></div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-gray-200 text-center">
                        <button className="text-sm text-gray-600 hover:text-gray-800">
                          View all notifications
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            
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
