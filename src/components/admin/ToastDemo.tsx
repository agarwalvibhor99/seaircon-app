'use client'

import { useState } from 'react'
import { notify } from '@/lib/toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ToastDemo() {
  const [isVisible, setIsVisible] = useState(false)

  if (!isVisible) {
    return (
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 z-40"
      >
        🎨 Toast Demo
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 left-4 w-80 z-40">
      <CardHeader className="pb-4">
        <CardTitle className="flex justify-between items-center">
          Toast Demo
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsVisible(false)}
          >
            ✕
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={() => notify.success('Success!', 'This is a success message')}
          className="w-full"
          size="sm"
        >
          Show Success Toast
        </Button>
        
        <Button 
          onClick={() => notify.error('Error!', 'This is an error message')}
          variant="destructive"
          className="w-full"
          size="sm"
        >
          Show Error Toast
        </Button>
      </CardContent>
    </Card>
  )
}
