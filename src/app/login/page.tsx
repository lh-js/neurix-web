'use client'

import { LoginForm } from '@/components/login/login-form'
import { useLogin } from '@/hooks/login/use-login'

export default function LoginPage() {
  const { loading, error, handleLogin } = useLogin()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <LoginForm 
          onSubmit={handleLogin}
          loading={loading}
          error={error}
        />
        
        {/* Footer Text */}
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          © 2025 Neurix. All rights reserved.
        </p>
      </div>
    </div>
  )
}

