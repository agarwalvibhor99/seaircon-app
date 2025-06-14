// Simple notification wrapper - shows only one toast at a time
import { toast } from './simple-toast'

export const notify = {
  success: (message: string, description?: string) => {
    toast.success(message, description)
  },
  
  error: (message: string, description?: string) => {
    toast.error(message, description)
  }
}
