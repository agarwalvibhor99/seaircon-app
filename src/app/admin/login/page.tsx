'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

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
        
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your employee credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="employee@seaircon.com"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Signing in...' : 'Sign In'}
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
