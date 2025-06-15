'use client';

import { useEffect } from 'react'
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the proper admin login page
    router.replace('/admin/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 mb-6 rounded-2xl overflow-hidden shadow-lg">
          <img 
            src="/se-aircon-logo.jpg" 
            alt="SE Aircon Logo" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  );
}
