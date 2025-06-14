'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  History, 
  Clock, 
  User, 
  MessageSquare,
  TrendingUp,
  ArrowRight
} from 'lucide-react'
import { LeadStatusHistoryService, StatusHistoryEntry } from '@/lib/lead-status-history.service'
import { formatDistanceToNow, format } from 'date-fns'

interface StatusHistoryModalProps {
  leadId: string
  leadName: string
  trigger?: React.ReactNode
}

const statusConfigs = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-800' },
  contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
  qualified: { label: 'Qualified', color: 'bg-green-100 text-green-800' },
  proposal_sent: { label: 'Proposal Sent', color: 'bg-purple-100 text-purple-800' },
  won: { label: 'Won', color: 'bg-green-100 text-green-800' },
  lost: { label: 'Lost', color: 'bg-red-100 text-red-800' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800' }
}

export default function StatusHistoryModal({ leadId, leadName, trigger }: StatusHistoryModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [history, setHistory] = useState<StatusHistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadStatusHistory = async () => {
    if (!leadId) return
    
    setIsLoading(true)
    try {
      const historyData = await LeadStatusHistoryService.getStatusHistory(leadId)
      setHistory(historyData)
    } catch (error) {
      console.error('Error loading status history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadStatusHistory()
    }
  }, [isOpen, leadId])

  const getStatusBadge = (status: string) => {
    const config = statusConfigs[status as keyof typeof statusConfigs] || statusConfigs.new
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <History className="h-4 w-4" />
      <span className="ml-1">History</span>
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Status History - {leadName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No status history available</p>
              <p className="text-sm">Status changes will appear here as they occur</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Timeline */}
              <div className="relative">
                {history.map((entry, index) => (
                  <div key={entry.id} className="relative">
                    {/* Timeline line */}
                    {index < history.length - 1 && (
                      <div className="absolute left-4 top-12 w-0.5 h-16 bg-gray-200" />
                    )}
                    
                    {/* Timeline entry */}
                    <div className="flex items-start gap-4 pb-6">
                      {/* Timeline dot */}
                      <div className="flex items-center justify-center w-8 h-8 bg-cyan-100 rounded-full flex-shrink-0 mt-1">
                        <TrendingUp className="h-4 w-4 text-cyan-600" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0 bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {entry.previous_status && (
                              <>
                                {getStatusBadge(entry.previous_status)}
                                <ArrowRight className="h-4 w-4 text-gray-400" />
                              </>
                            )}
                            {getStatusBadge(entry.new_status)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            {(() => {
                              // Safe date handling with validation - handle different field names
                              const dateValue = entry.changed_at || entry.created_at;
                              if (!dateValue) {
                                return <span className="text-gray-400">No date available</span>;
                              }
                              
                              const date = new Date(dateValue);
                              const isValidDate = !isNaN(date.getTime());
                              
                              if (!isValidDate) {
                                return <span className="text-red-500">Invalid date: {dateValue}</span>;
                              }
                              
                              return (
                                <span title={format(date, 'PPpp')}>
                                  {formatDistanceToNow(date)} ago
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                        
                        {entry.change_reason && (
                          <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                            <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>{entry.change_reason}</span>
                          </div>
                        )}
                        
                        {entry.notes && (
                          <div className="text-sm text-gray-600 bg-white rounded p-2 border-l-4 border-cyan-200">
                            {entry.notes}
                          </div>
                        )}
                        
                        {entry.changed_by && (
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                            <User className="h-3 w-3" />
                            <span>Changed by user</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Summary */}
              <div className="border-t pt-4">
                <div className="bg-cyan-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Timeline Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Changes:</span>
                      <span className="ml-2 font-medium">{history.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Current Status:</span>
                      <span className="ml-2">{getStatusBadge(history[0]?.new_status || 'new')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
