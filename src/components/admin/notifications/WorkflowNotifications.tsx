'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, CheckCircle, Clock, ArrowRight, X } from 'lucide-react'
import Link from 'next/link'

interface Notification {
  id: string
  type: 'quotation_approved' | 'project_overdue' | 'payment_due'
  title: string
  message: string
  data: any
  created_at: string
  read: boolean
}

interface WorkflowNotificationsProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onDismiss: (id: string) => void
}

export default function WorkflowNotifications({ 
  notifications, 
  onMarkAsRead, 
  onDismiss 
}: WorkflowNotificationsProps) {
  const [visibleNotifications, setVisibleNotifications] = useState(notifications)

  useEffect(() => {
    setVisibleNotifications(notifications.filter(n => !n.read))
  }, [notifications])

  const handleCreateProject = (quotationId: string, notificationId: string) => {
    onMarkAsRead(notificationId)
    // Navigate to create project with pre-selected quotation
    window.location.href = `/admin/projects/create?quotation_id=${quotationId}`
  }

  const handleDismiss = (id: string) => {
    onDismiss(id)
    setVisibleNotifications(prev => prev.filter(n => n.id !== id))
  }

  if (visibleNotifications.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Workflow Notifications
            <Badge variant="secondary">{visibleNotifications.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {visibleNotifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 border-blue-200"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-sm">{notification.title}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-500">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {notification.type === 'quotation_approved' && (
                  <Button
                    size="sm"
                    onClick={() => handleCreateProject(notification.data.quotation_id, notification.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <ArrowRight className="h-3 w-3 mr-1" />
                    Create Project
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDismiss(notification.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
