import { createBrowserClient } from '@supabase/ssr'
import { notify } from '@/lib/toast'

// Create a singleton Supabase client for consistent usage
export const getSupabaseClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Check if user is authenticated and get session
export const checkAuth = async () => {
  const supabase = getSupabaseClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error || !session) {
    return { isAuthenticated: false, session: null, error }
  }
  
  return { isAuthenticated: true, session, error: null }
}

// Get current user from Supabase session
export const getCurrentUser = async () => {
  const supabase = getSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return { user: null, error }
  }
  
  return { user, error: null }
}

// Get auth headers for API calls
export const getAuthHeaders = async () => {
  // With Supabase session auth, cookies are automatically sent by the browser
  // We just need to include basic headers
  return {
    'Content-Type': 'application/json',
  }
}

// Handle auth errors consistently
export const handleAuthError = (router: any, message = 'Session expired. Please log in again.') => {
  notify.error(message)
  router.push('/login')
}

// Sign out user
export const signOut = async (router: any) => {
  const supabase = getSupabaseClient()
  
  try {
    await supabase.auth.signOut()
    router.push('/login')
  } catch (error) {
    console.error('Sign out error:', error)
    // Force redirect even if sign out fails
    router.push('/login')
  }
}

// Redirect if not authenticated
export const requireAuth = async (router: any) => {
  const { isAuthenticated } = await checkAuth()
  
  if (!isAuthenticated) {
    handleAuthError(router)
    return false
  }
  
  return true
}
