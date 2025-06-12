// Main CRM Service - Aggregates all individual services
import { ConsultationRequestsService } from './consultation-requests.service'
import { ContactHistoryService } from './contact-history.service'
import { AnalyticsService } from './analytics.service'

// Re-export all services for easy access
export { ConsultationRequestsService } from './consultation-requests.service'
export { ContactHistoryService } from './contact-history.service'
export { AnalyticsService } from './analytics.service'

// Re-export types
export * from './types'

/**
 * Main CRM Service Class
 * Provides a unified interface to all CRM functionality
 */
export class CRMService {
  // Consultation Requests - delegate to specific service
  static consultationRequests = ConsultationRequestsService
  
  // Contact History - delegate to specific service
  static contactHistory = ContactHistoryService
  
  // Analytics - delegate to specific service
  static analytics = AnalyticsService

  // Legacy methods for backward compatibility
  static async createConsultationRequest(data: any) {
    return ConsultationRequestsService.create(data)
  }

  static async getConsultationRequests(filters?: any) {
    return ConsultationRequestsService.getAll(filters)
  }

  static async getConsultationRequestById(id: string) {
    return ConsultationRequestsService.getById(id)
  }

  static async updateConsultationRequest(id: string, updates: any) {
    return ConsultationRequestsService.update(id, updates)
  }

  static async deleteConsultationRequest(id: string) {
    return ConsultationRequestsService.delete(id)
  }

  static async addContactHistory(data: any) {
    return ContactHistoryService.add(data)
  }

  static async getContactHistory(consultationRequestId: string) {
    return ContactHistoryService.getByConsultationRequestId(consultationRequestId)
  }

  static async getDashboardStats() {
    return AnalyticsService.getDashboardStats()
  }

  static async getUpcomingFollowUps() {
    return ConsultationRequestsService.getUpcomingFollowUps()
  }

  static async searchConsultationRequests(searchTerm: string) {
    return ConsultationRequestsService.search(searchTerm)
  }
}
