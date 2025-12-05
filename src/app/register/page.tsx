'use client'

import { RegisterForm } from './components/register-form'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50">
      <div className="w-full max-w-md">
        <RegisterForm />

        {/* Footer Text */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          已有账号？{' '}
          <a
            href="/login"
            className="font-medium text-primary hover:text-primary/80 underline underline-offset-4"
          >
            去登录
          </a>
        </p>
      </div>
    </div>
  )
}