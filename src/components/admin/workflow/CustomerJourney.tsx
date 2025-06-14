'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  FileText, 
  Briefcase, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'

interface WorkflowStep {
  id: string
  name: string
  status: 'completed' | 'current' | 'pending' | 'blocked'
  icon: any
  description: string
  date?: string
  data?: any
}

interface CustomerJourneyProps {
  customerId: string
  currentStep: 'lead' | 'quotation' | 'project' | 'invoice' | 'payment'
  steps: WorkflowStep[]
  onStepClick?: (step: WorkflowStep) => void
}

export default function CustomerJourney({ 
  customerId, 
  currentStep, 
  steps, 
  onStepClick 
}: CustomerJourneyProps) {
  const defaultSteps: WorkflowStep[] = [
    {
      id: 'lead',
      name: 'Lead',
      status: 'completed',
      icon: Users,
      description: 'Customer inquiry received',
      date: '2025-06-01'
    },
    {
      id: 'quotation',
      name: 'Quotation',
      status: currentStep === 'quotation' ? 'current' : 
              currentStep === 'project' || currentStep === 'invoice' || currentStep === 'payment' ? 'completed' : 'pending',
      icon: FileText,
      description: 'Quote prepared and sent',
      date: currentStep !== 'lead' ? '2025-06-05' : undefined
    },
    {
      id: 'project',
      name: 'Project',
      status: currentStep === 'project' ? 'current' : 
              currentStep === 'invoice' || currentStep === 'payment' ? 'completed' : 'pending',
      icon: Briefcase,
      description: 'Project in progress',
      date: currentStep === 'project' || currentStep === 'invoice' || currentStep === 'payment' ? '2025-06-10' : undefined
    },
    {
      id: 'invoice',
      name: 'Invoice',
      status: currentStep === 'invoice' ? 'current' : 
              currentStep === 'payment' ? 'completed' : 'pending',
      icon: CreditCard,
      description: 'Invoice generated',
      date: currentStep === 'invoice' || currentStep === 'payment' ? '2025-06-12' : undefined
    },
    {
      id: 'payment',
      name: 'Payment',
      status: currentStep === 'payment' ? 'completed' : 'pending',
      icon: CheckCircle,
      description: 'Payment received',
      date: currentStep === 'payment' ? '2025-06-15' : undefined
    }
  ]

  const workflowSteps = steps.length > 0 ? steps : defaultSteps

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'current':
        return <Clock className="h-5 w-5 text-blue-600" />
      case 'blocked':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-300'
      case 'current':
        return 'bg-blue-100 border-blue-300'
      case 'blocked':
        return 'bg-red-100 border-red-300'
      default:
        return 'bg-gray-100 border-gray-300'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Customer Journey Workflow
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon
            const isLast = index === workflowSteps.length - 1
            
            return (
              <div key={step.id} className="relative">
                <div 
                  className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${getStatusColor(step.status)}`}
                  onClick={() => onStepClick?.(step)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Icon className="h-6 w-6" />
                      <div className="absolute -top-1 -right-1">
                        {getStatusIcon(step.status)}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{step.name}</h3>
                        <Badge variant={
                          step.status === 'completed' ? 'default' : 
                          step.status === 'current' ? 'secondary' : 'outline'
                        }>
                          {step.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{step.description}</p>
                      {step.date && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(step.date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
                
                {!isLast && (
                  <div className="flex justify-center py-2">
                    <div className="w-px h-6 bg-gray-300"></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Progress: {workflowSteps.filter(s => s.status === 'completed').length} of {workflowSteps.length} completed
            </span>
            <div className="flex gap-2">
              <Link href={`/admin/customers/${customerId}`}>
                <Button size="sm" variant="outline">
                  View Customer
                </Button>
              </Link>
              {currentStep !== 'payment' && (
                <Link href={`/admin/${currentStep}s/create?customer_id=${customerId}`}>
                  <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                    Next Step
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
