'use client'

import { ForgotPasswordForm } from './components/forgot-password-form'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50">
      <div className="w-full max-w-md">
        <ForgotPasswordForm />

        {/* Footer Text */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          想起密码了？{' '}
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
