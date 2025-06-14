'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Loader2 } from 'lucide-react'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Handle URL parameters for errors and messages
  useEffect(() => {
    const urlError = searchParams.get('error')
    if (urlError) {
      switch (urlError) {
        case 'unauthorized':
          setError('Access denied. Employee account required.')
          break
        case 'session_expired':
          setError('Your session has expired. Please sign in again.')
          break
        case 'auth_error':
          setError('Authentication error. Please try again.')
          break
        case 'account_deactivated':
          setError('Your account has been deactivated. Please contact administrator.')
          break
        default:
          setError('An error occurred. Please try again.')
      }
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Sign in with Supabase Auth
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        // Provide more specific error messages
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.')
        } else if (authError.message.includes('Email not confirmed')) {
          throw new Error('Please confirm your email address before signing in.')
        } else {
          throw new Error(`Authentication failed: ${authError.message}`)
        }
      }

      // Check if user is an employee
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email)
        .single()

      if (employeeError || !employee) {
        throw new Error('Access denied. Employee account required. Please contact administrator.')
      }

      if (!employee.is_active) {
        throw new Error('Account is deactivated. Please contact administrator.')
      }

      // Success - redirect to intended page or dashboard
      const redirectTo = searchParams.get('redirect') || '/admin/dashboard'
      router.push(redirectTo)
      router.refresh()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      setError(errorMessage)
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
            <span className="text-white font-bold text-2xl">SE</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Employee Dashboard
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            SE Aircon CRM System
          </p>
        </div>
        
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
            <CardDescription className="text-center text-cyan-50">
              Enter your employee credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium">Authentication Error</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="employee@seaircon.com"
                  className="transition-all duration-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 border-gray-300 hover:border-gray-400"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 border-gray-300 hover:border-gray-400"
                />
              </div>
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="text-center text-sm text-gray-500">
          <p>For employee access only</p>
          <p>Contact admin for account setup</p>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-left">
              <p className="font-medium text-blue-800 mb-2">Development Info:</p>
              <p className="text-blue-700 text-xs">Default credentials: admin@seaircon.com / admin123!</p>
              <p className="text-blue-700 text-xs">Need help? Check FIX_INVALID_CREDENTIALS.md</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
