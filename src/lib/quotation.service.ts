import { createBrowserClient } from '@supabase/ssr'
import type { Quotation, QuotationInsert, QuotationUpdate, QuotationItem, QuoteToInvoiceConversion } from './enhanced-types'
import { projectActivityService } from './project-activity.service'

/**
 * Service for managing quotations with versioning and workflow
 */
export class QuotationService {
  private supabase

  constructor() {
    this.supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  /**
   * Create a new quotation
   */
  async createQuotation(data: QuotationInsert, items: Omit<QuotationItem, 'id' | 'quotation_id' | 'created_at'>[]): Promise<Quotation | null> {
    try {
      const { data: user } = await this.supabase.auth.getUser()
      if (!user.user) return null

      // Get employee ID
      const { data: employee } = await this.supabase
        .from('employees')
        .select('id')
        .eq('email', user.user.email)
        .single()

      if (!employee) return null

      // Calculate totals from items
      const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
      const discountAmount = (subtotal * (data.discount_percentage || 0)) / 100
      const taxableAmount = subtotal - discountAmount
      const taxAmount = (taxableAmount * (data.tax_rate || 18)) / 100
      const totalAmount = taxableAmount + taxAmount

      const quotationData = {
        ...data,
        created_by: employee.id,
        subtotal,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount
      }

      // Create quotation
      const { data: quotation, error } = await this.supabase
        .from('quotations')
        .insert([quotationData])
        .select(`
          *,
          project:projects(project_name, project_number),
          customer:customers(name, email, phone),
          created_by_employee:employees!quotations_created_by_fkey(full_name)
        `)
        .single()

      if (error) throw error

      // Create quotation items
      if (items.length > 0) {
        const quotationItems = items.map(item => ({
          ...item,
          quotation_id: quotation.id,
          total_amount: item.quantity * item.unit_price
        }))

        const { error: itemsError } = await this.supabase
          .from('quotation_items')
          .insert(quotationItems)

        if (itemsError) throw itemsError
      }

      // Log activity
      if (quotation.project_id) {
        await projectActivityService.logQuoteCreated(
          quotation.project_id,
          quotation.id,
          quotation.quote_number
        )
      }

      return quotation
    } catch (error) {
      console.error('Error creating quotation:', error)
      return null
    }
  }

  /**
   * Get quotation by ID with items
   */
  async getQuotation(id: string): Promise<Quotation | null> {
    try {
      const { data, error } = await this.supabase
        .from('quotations')
        .select(`
          *,
          project:projects(project_name, project_number),
          customer:customers(name, email, phone),
          created_by_employee:employees!quotations_created_by_fkey(full_name),
          quote_items:quotation_items(*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching quotation:', error)
      return null
    }
  }

  /**
   * Get quotations for a project
   */
  async getProjectQuotations(projectId: string): Promise<Quotation[]> {
    try {
      const { data, error } = await this.supabase
        .from('quotations')
        .select(`
          *,
          project:projects(project_name, project_number),
          customer:customers(name, email, phone),
          created_by_employee:employees!quotations_created_by_fkey(full_name)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching project quotations:', error)
      return []
    }
  }

  /**
   * Update quotation status
   */
  async updateQuotationStatus(id: string, status: Quotation['status'], notes?: string): Promise<boolean> {
    try {
      const { data: quotation, error } = await this.supabase
        .from('quotations')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('project_id, quote_number')
        .single()

      if (error) throw error

      // Log activity based on status
      if (quotation.project_id) {
        switch (status) {
          case 'sent':
            await projectActivityService.logQuoteSent(quotation.project_id, id, quotation.quote_number)
            break
          case 'approved':
            await projectActivityService.logQuoteApproved(quotation.project_id, id, quotation.quote_number)
            break
          case 'rejected':
            await projectActivityService.logQuoteRejected(quotation.project_id, id, quotation.quote_number, notes)
            break
        }
      }

      return true
    } catch (error) {
      console.error('Error updating quotation status:', error)
      return false
    }
  }

  /**
   * Create new version of quotation
   */
  async createQuotationVersion(originalId: string, changes: Partial<QuotationInsert>): Promise<Quotation | null> {
    try {
      // Get original quotation
      const original = await this.getQuotation(originalId)
      if (!original) return null

      // Mark original as superseded
      await this.updateQuotationStatus(originalId, 'superseded')

      // Extract version number and increment
      const versionMatch = original.version.match(/v(\d+)/)
      const currentVersion = versionMatch ? parseInt(versionMatch[1]) : 1
      const newVersion = `v${currentVersion + 1}`

      // Create new quotation with incremented version
      const newQuotationData: QuotationInsert = {
        ...original,
        ...changes,
        version: newVersion,
        status: 'draft',
        sent_date: undefined,
        approved_date: undefined
      }

      // Remove computed fields that shouldn't be copied
      delete (newQuotationData as any).id
      delete (newQuotationData as any).created_at
      delete (newQuotationData as any).updated_at
      delete (newQuotationData as any).project
      delete (newQuotationData as any).customer
      delete (newQuotationData as any).created_by_employee
      delete (newQuotationData as any).quote_items

      // Get original items
      const { data: originalItems } = await this.supabase
        .from('quotation_items')
        .select('*')
        .eq('quotation_id', originalId)

      // Create new quotation with items
      return this.createQuotation(newQuotationData, originalItems || [])
    } catch (error) {
      console.error('Error creating quotation version:', error)
      return null
    }
  }

  /**
   * Convert approved quotation to invoice
   */
  async convertToInvoice(conversionData: QuoteToInvoiceConversion): Promise<string | null> {
    try {
      const quotation = await this.getQuotation(conversionData.quote_id)
      if (!quotation || quotation.status !== 'approved') {
        throw new Error('Quotation must be approved to convert to invoice')
      }

      const { data: user } = await this.supabase.auth.getUser()
      if (!user.user) return null

      const { data: employee } = await this.supabase
        .from('employees')
        .select('id')
        .eq('email', user.user.email)
        .single()

      if (!employee) return null

      // Calculate invoice amount based on conversion type
      let invoiceAmount = quotation.total_amount
      if (conversionData.invoice_type === 'partial' && conversionData.percentage) {
        invoiceAmount = (quotation.total_amount * conversionData.percentage) / 100
      }

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`

      // Create invoice
      const invoiceData = {
        invoice_number: invoiceNumber,
        invoice_type: 'invoice' as const,
        quote_id: quotation.id,
        quote_version: quotation.version,
        project_id: quotation.project_id,
        customer_id: quotation.customer_id,
        created_by: employee.id,
        status: 'draft' as const,
        subtotal: invoiceAmount,
        tax_rate: quotation.tax_rate,
        tax_amount: (invoiceAmount * quotation.tax_rate) / 100,
        total_amount: invoiceAmount + ((invoiceAmount * quotation.tax_rate) / 100),
        amount_paid: 0,
        balance_due: invoiceAmount + ((invoiceAmount * quotation.tax_rate) / 100),
        issue_date: new Date().toISOString().split('T')[0],
        due_date: conversionData.due_date,
        payment_terms: conversionData.payment_terms,
        notes: conversionData.notes
      }

      const { data: invoice, error } = await this.supabase
        .from('invoices')
        .insert([invoiceData])
        .select('id, invoice_number')
        .single()

      if (error) throw error

      // Copy quotation items to invoice items (adjusted for partial invoices)
      if (quotation.quote_items && quotation.quote_items.length > 0) {
        const invoiceItems = quotation.quote_items.map(item => ({
          invoice_id: invoice.id,
          description: item.description,
          quantity: conversionData.invoice_type === 'partial' ? 
            item.quantity * ((conversionData.percentage || 100) / 100) : 
            item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          total_amount: conversionData.invoice_type === 'partial' ?
            item.total_amount * ((conversionData.percentage || 100) / 100) :
            item.total_amount,
          category: item.category,
          notes: item.notes
        }))

        const { error: itemsError } = await this.supabase
          .from('invoice_items')
          .insert(invoiceItems)

        if (itemsError) throw itemsError
      }

      // Log activity
      if (quotation.project_id) {
        await projectActivityService.logInvoiceCreated(
          quotation.project_id,
          invoice.id,
          invoice.invoice_number
        )
      }

      return invoice.id
    } catch (error) {
      console.error('Error converting quotation to invoice:', error)
      return null
    }
  }

  /**
   * Get quotation statistics
   */
  async getQuotationStats(projectId?: string) {
    try {
      let query = this.supabase
        .from('quotations')
        .select('status, total_amount, created_at')

      if (projectId) {
        query = query.eq('project_id', projectId)
      }

      const { data, error } = await query

      if (error) throw error

      const stats = {
        total: data.length,
        byStatus: data.reduce((acc: Record<string, number>, quote) => {
          acc[quote.status] = (acc[quote.status] || 0) + 1
          return acc
        }, {}),
        totalValue: data.reduce((sum, quote) => sum + quote.total_amount, 0),
        approvedValue: data
          .filter(quote => quote.status === 'approved')
          .reduce((sum, quote) => sum + quote.total_amount, 0),
        conversionRate: data.length > 0 ? 
          (data.filter(quote => quote.status === 'approved').length / data.length) * 100 : 0
      }

      return stats
    } catch (error) {
      console.error('Error getting quotation stats:', error)
      return null
    }
  }

  /**
   * Search quotations
   */
  async searchQuotations(params: {
    search?: string
    status?: string
    project_id?: string
    customer_id?: string
    page?: number
    limit?: number
  }) {
    try {
      const { search, status, project_id, customer_id, page = 1, limit = 10 } = params

      let query = this.supabase
        .from('quotations')
        .select(`
          *,
          project:projects(project_name, project_number),
          customer:customers(name, email, phone),
          created_by_employee:employees!quotations_created_by_fkey(full_name)
        `, { count: 'exact' })

      // Apply filters
      if (search) {
        query = query.or(`quote_number.ilike.%${search}%,quote_title.ilike.%${search}%`)
      }
      if (status) {
        query = query.eq('status', status)
      }
      if (project_id) {
        query = query.eq('project_id', project_id)
      }
      if (customer_id) {
        query = query.eq('customer_id', customer_id)
      }

      // Apply pagination
      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to).order('created_at', { ascending: false })

      const { data, error, count } = await query

      if (error) throw error

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }
    } catch (error) {
      console.error('Error searching quotations:', error)
      return {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
      }
    }
  }
}

// Export singleton instance
export const quotationService = new QuotationService()
