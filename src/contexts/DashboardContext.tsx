'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface DashboardContextType {
  refreshKey: number
  refreshDashboard: () => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export const useDashboard = () => {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}

interface DashboardProviderProps {
  children: ReactNode
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState(0)

  const refreshDashboard = () => {
    console.log('🔄 Dashboard refresh triggered')
    setRefreshKey(prev => prev + 1)
  }

  return (
    <DashboardContext.Provider value={{ refreshKey, refreshDashboard }}>
      {children}
    </DashboardContext.Provider>
  )
}
