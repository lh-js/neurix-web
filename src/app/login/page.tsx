'use client'

import { LoginForm } from './components/login-form'
import { useLogin } from '@/hooks/login/use-login'

export default function LoginPage() {
  const { loading, error, handleLogin } = useLogin()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50">
      <div className="w-full max-w-md">
        <LoginForm onSubmit={handleLogin} loading={loading} error={error} />

        {/* Footer Text */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            还没有账号？{' '}
            <a
              href="/register"
              className="font-medium text-primary hover:text-primary/80 underline underline-offset-4"
            >
              去注册
            </a>
          </p>
          <p className="text-sm text-muted-foreground">
            <a
              href="/forgot-password"
              className="font-medium text-primary hover:text-primary/80 underline underline-offset-4"
            >
              忘记密码？
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
