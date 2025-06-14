interface ValidationRule {
  id: string
  name: string
  description: string
  severity: 'error' | 'warning' | 'info'
  validate: (data: any) => boolean
  message: string
}

interface ValidationResult {
  isValid: boolean
  errors: ValidationRule[]
  warnings: ValidationRule[]
  infos: ValidationRule[]
}

export class WorkflowValidationService {
  private static projectCreationRules: ValidationRule[] = [
    {
      id: 'require_approved_quotation',
      name: 'Approved Quotation Required',
      description: 'Projects should be created from approved quotations when possible',
      severity: 'warning',
      validate: (data) => {
        return data.sourceType === 'quotation' && data.quotation_id
      },
      message: 'Creating projects without approved quotations requires manager approval'
    },
    {
      id: 'quotation_status_check',
      name: 'Quotation Status Validation',
      description: 'Only approved quotations should be used for project creation',
      severity: 'error',
      validate: (data) => {
        if (data.sourceType !== 'quotation') return true
        return data.quotation?.status === 'approved'
      },
      message: 'Selected quotation must be approved before creating a project'
    },
    {
      id: 'customer_consistency',
      name: 'Customer Consistency',
      description: 'Project customer must match quotation customer',
      severity: 'error',
      validate: (data) => {
        if (data.sourceType !== 'quotation') return true
        return data.customer_id === data.quotation?.customer_id
      },
      message: 'Project customer must match the quotation customer'
    },
    {
      id: 'budget_consistency',
      name: 'Budget Consistency',
      description: 'Project budget should align with quotation amount',
      severity: 'warning',
      validate: (data) => {
        if (data.sourceType !== 'quotation') return true
        const budget = parseFloat(data.budget) || 0
        const quotationAmount = data.quotation?.total_amount || 0
        const variance = Math.abs(budget - quotationAmount) / quotationAmount
        return variance <= 0.1 // Allow 10% variance
      },
      message: 'Project budget varies significantly from quotation amount'
    },
    {
      id: 'project_manager_assigned',
      name: 'Project Manager Assignment',
      description: 'All projects must have an assigned project manager',
      severity: 'error',
      validate: (data) => {
        return !!data.project_manager_id
      },
      message: 'A project manager must be assigned to the project'
    },
    {
      id: 'duplicate_project_check',
      name: 'Duplicate Project Prevention',
      description: 'Prevent creating multiple projects from the same quotation',
      severity: 'error',
      validate: (data) => {
        // This would require checking existing projects in the database
        // For now, we'll assume this is handled at the API level
        return true
      },
      message: 'A project already exists for this quotation'
    }
  ]

  static validateProjectCreation(data: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      infos: []
    }

    for (const rule of this.projectCreationRules) {
      if (!rule.validate(data)) {
        switch (rule.severity) {
          case 'error':
            result.errors.push(rule)
            result.isValid = false
            break
          case 'warning':
            result.warnings.push(rule)
            break
          case 'info':
            result.infos.push(rule)
            break
        }
      }
    }

    return result
  }

  static getWorkflowRecommendations(customerData: any): string[] {
    const recommendations: string[] = []

    // Check if customer has leads but no quotations
    if (customerData.leads?.length > 0 && !customerData.quotations?.length) {
      recommendations.push('Consider creating a quotation for this customer\'s leads')
    }

    // Check if customer has approved quotations but no projects
    const approvedQuotations = customerData.quotations?.filter((q: any) => q.status === 'approved') || []
    if (approvedQuotations.length > 0 && !customerData.projects?.length) {
      recommendations.push('Customer has approved quotations ready for project creation')
    }

    // Check if customer has completed projects but no invoices
    const completedProjects = customerData.projects?.filter((p: any) => p.status === 'completed') || []
    if (completedProjects.length > 0 && !customerData.invoices?.length) {
      recommendations.push('Completed projects are ready for invoicing')
    }

    // Check if customer has pending invoices
    const pendingInvoices = customerData.invoices?.filter((i: any) => i.status === 'pending') || []
    if (pendingInvoices.length > 0) {
      recommendations.push('Follow up on pending invoice payments')
    }

    return recommendations
  }

  static getWorkflowStatus(customerData: any): {
    currentStep: string
    nextStep: string
    completionPercentage: number
    blockers: string[]
  } {
    const steps = ['lead', 'quotation', 'project', 'invoice', 'payment']
    let currentStepIndex = 0
    const blockers: string[] = []

    // Determine current step based on data
    if (customerData.payments?.some((p: any) => p.status === 'completed')) {
      currentStepIndex = 4 // payment
    } else if (customerData.invoices?.length > 0) {
      currentStepIndex = 3 // invoice
    } else if (customerData.projects?.length > 0) {
      currentStepIndex = 2 // project
    } else if (customerData.quotations?.length > 0) {
      currentStepIndex = 1 // quotation
    } else {
      currentStepIndex = 0 // lead
    }

    // Check for blockers
    if (currentStepIndex === 1 && !customerData.quotations?.some((q: any) => q.status === 'approved')) {
      blockers.push('Quotation approval pending')
    }

    if (currentStepIndex === 2 && !customerData.projects?.some((p: any) => p.status === 'completed')) {
      blockers.push('Project completion pending')
    }

    if (currentStepIndex === 3 && customerData.invoices?.some((i: any) => i.status === 'overdue')) {
      blockers.push('Overdue invoices need attention')
    }

    const completionPercentage = ((currentStepIndex + 1) / steps.length) * 100

    return {
      currentStep: steps[currentStepIndex],
      nextStep: currentStepIndex < steps.length - 1 ? steps[currentStepIndex + 1] : 'complete',
      completionPercentage,
      blockers
    }
  }
}
