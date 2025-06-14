'use client'

import { useState, useEffect } from 'react'
import WorkflowNotifications from './WorkflowNotifications'

interface Notification {
  id: string
  type: 'quotation_approved' | 'project_overdue' | 'payment_due'
  title: string
  message: string
  data: any
  created_at: string
  read: boolean
}

interface WorkflowNotificationsWrapperProps {
  initialNotifications?: Notification[]
}

export default function WorkflowNotificationsWrapper({ 
  initialNotifications = [] 
}: WorkflowNotificationsWrapperProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
    // TODO: Update notification status in database
  }

  const handleDismiss = (id: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    )
    // TODO: Dismiss notification in database
  }

  return (
    <WorkflowNotifications 
      notifications={notifications}
      onMarkAsRead={handleMarkAsRead}
      onDismiss={handleDismiss}
    />
  )
}
