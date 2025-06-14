'use client'

import { DashboardProvider } from '@/contexts/DashboardContext'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth is handled by middleware, so we just render the children
  return (
    <DashboardProvider>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </DashboardProvider>
  )
}
