'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Phone, 
  CheckCircle, 
  FileText, 
  Clock,
  TrendingUp,
  Trophy,
  XCircle
} from 'lucide-react'
import { LeadStatusHistoryService } from '@/lib/lead-status-history.service'
import { notify } from '@/lib/toast'

// Import the proper Lead type from the shared types
interface Lead {
  id: string
  name: string
  email: string
  phone: string
  company?: string
  service_type: string
  message: string
  urgency_level: string
  preferred_contact_method: string
  preferred_contact_time?: string
  location?: string
  property_type: string
  estimated_value?: number
  source: string
  notes?: string
  status: string
  created_at: string
  updated_at: string
}

interface QuickStatusUpdateProps {
  lead: Lead
  onStatusUpdate: () => void
  onConvertToProject?: (lead: Lead) => void | Promise<void>
  compact?: boolean
}

interface StatusConfig {
  label: string
  color: string
  icon: React.ReactNode
  nextSteps: string[]
}

const statusConfigs: Record<string, StatusConfig> = {
  new: {
    label: 'New',
    color: 'bg-blue-100 text-blue-800',
    icon: <Clock className="h-3 w-3" />,
    nextSteps: ['contacted']
  },
  contacted: {
    label: 'Contacted',
    color: 'bg-yellow-100 text-yellow-800',
    icon: <Phone className="h-3 w-3" />,
    nextSteps: ['qualified', 'lost']
  },
  qualified: {
    label: 'Qualified',
    color: 'bg-green-100 text-green-800',
    icon: <CheckCircle className="h-3 w-3" />,
    nextSteps: ['proposal_sent', 'lost']
  },
  proposal_sent: {
    label: 'Proposal Sent',
    color: 'bg-purple-100 text-purple-800',
    icon: <FileText className="h-3 w-3" />,
    nextSteps: ['won', 'lost']
  },
  won: {
    label: 'Won (Convert to Project)',
    color: 'bg-green-100 text-green-800',
    icon: <Trophy className="h-3 w-3" />,
    nextSteps: []
  },
  lost: {
    label: 'Lost',
    color: 'bg-red-100 text-red-800',
    icon: <XCircle className="h-3 w-3" />,
    nextSteps: []
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-800',
    icon: <XCircle className="h-3 w-3" />,
    nextSteps: []
  }
}

export default function QuickStatusUpdate({ lead, onStatusUpdate, onConvertToProject, compact = false }: QuickStatusUpdateProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  
  const currentStatus = lead.status || 'new'
  const statusConfig = statusConfigs[currentStatus] || statusConfigs.new
  const nextSteps = statusConfig.nextSteps

  const handleStatusUpdate = async (newStatus: string) => {
    if (isUpdating) return
    
    setIsUpdating(true)
    
    try {
      // Special handling for "won" status - should convert to project
      if (newStatus === 'won') {
        if (onConvertToProject) {
          // Open the conversion modal instead of just updating status
          console.log('Opening conversion modal for lead:', lead.name)
          onConvertToProject(lead)
          setIsUpdating(false)
          return
        } else {
          // Fallback behavior if no conversion handler provided
          const confirmed = confirm(
            `Mark "${lead.name}" as Won?\n\n` +
            `This will:\n` +
            `• Update the lead status to "Won"\n` +
            `• The lead should then be converted to a project\n\n` +
            `Continue?`
          )
          
          if (!confirmed) {
            setIsUpdating(false)
            return
          }
          
          notify.success(`Lead marked as Won! Please convert to project using the convert button.`)
        }
      }
      
      const result = await LeadStatusHistoryService.updateLeadStatus(
        lead.id,
        newStatus,
        `Quick update via lead dashboard`,
        `Status changed from ${lead.status} to ${newStatus} by user action`
      )
      
      if (result.success) {
        notify.success(`Lead status updated to ${statusConfigs[newStatus]?.label || newStatus}`)
        
        // Give a small delay to ensure database is updated, then refresh both leads and dashboard
        setTimeout(() => {
          onStatusUpdate()
        }, 100)
      } else {
        notify.error(result.error || 'Failed to update lead status')
      }
    } catch (error) {
      console.error('Error updating lead status:', error)
      notify.error('Failed to update lead status')
    } finally {
      setIsUpdating(false)
    }
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Badge className={statusConfig.color}>
          {statusConfig.icon}
          <span className="ml-1">{statusConfig.label}</span>
        </Badge>
        {nextSteps.length > 0 && (
          <div className="flex gap-1">
            {nextSteps.map((nextStatus) => {
              const nextConfig = statusConfigs[nextStatus]
              if (!nextConfig) return null
              
              return (
                <Button
                  key={nextStatus}
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusUpdate(nextStatus)}
                  disabled={isUpdating}
                  className="h-6 px-2 text-xs"
                  title={`Mark as ${nextConfig.label}`}
                >
                  {nextConfig.icon}
                </Button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Current Status */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600">Status:</span>
        <Badge className={statusConfig.color}>
          {statusConfig.icon}
          <span className="ml-1">{statusConfig.label}</span>
        </Badge>
      </div>

      {/* Quick Actions */}
      {nextSteps.length > 0 && (
        <div className="space-y-2">
          <span className="text-sm font-medium text-gray-600">Quick Actions:</span>
          <div className="flex flex-wrap gap-2">
            {nextSteps.map((nextStatus) => {
              const nextConfig = statusConfigs[nextStatus]
              if (!nextConfig) return null
              
              return (
                <Button
                  key={nextStatus}
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusUpdate(nextStatus)}
                  disabled={isUpdating}
                  className="flex items-center gap-2 text-xs"
                >
                  {nextConfig.icon}
                  <span>Mark as {nextConfig.label}</span>
                  {isUpdating && <TrendingUp className="h-3 w-3 animate-pulse" />}
                </Button>
              )
            })}
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Lead Progress</span>
          <span>
            {Object.keys(statusConfigs).indexOf(currentStatus) + 1} of {Object.keys(statusConfigs).length - 1} steps
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-gray-600 h-1.5 rounded-full transition-all duration-300"
            style={{
              width: `${((Object.keys(statusConfigs).indexOf(currentStatus) + 1) / (Object.keys(statusConfigs).length - 1)) * 100}%`
            }}
          />
        </div>
      </div>
    </div>
  )
}
