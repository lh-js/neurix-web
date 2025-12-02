'use client'

import { LoginForm } from '@/components/login/login-form'
import { useLogin } from '@/hooks/login/use-login'

export default function LoginPage() {
  const { loading, error, handleLogin } = useLogin()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50">
      <div className="w-full max-w-md">
        <LoginForm onSubmit={handleLogin} loading={loading} error={error} />

        {/* Footer Text */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          © 2025 Neurix. All rights reserved.
        </p>
      </div>
    </div>
  )
}
