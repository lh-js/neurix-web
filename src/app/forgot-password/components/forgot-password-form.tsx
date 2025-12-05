'use client'

import { useState, useEffect, FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useForgotPassword, ForgotPasswordFormData } from '@/hooks/forgot-password/use-forgot-password'

interface ForgotPasswordFormProps {
  onSuccess?: () => void
}

export function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
  const {
    loading,
    sendCodeLoading,
    verifyCodeLoading,
    error,
    countdown,
    verificationToken,
    handleSendCode,
    handleVerifyCode,
    handleChangePassword,
    cleanup,
  } = useForgotPassword()

  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: '',
    code: '',
    newPassword: '',
  })

  const [step, setStep] = useState<'email' | 'verify' | 'reset'>('email')

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  // 当有verificationToken时，进入重置密码步骤
  useEffect(() => {
    if (verificationToken) {
      setStep('reset')
    }
  }, [verificationToken])

  const handleEmailSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await handleSendCode(formData.email)
      setStep('verify')
    } catch (err) {
      // 错误已在hook中处理
    }
  }

  const handleVerifySubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await handleVerifyCode(formData.email, formData.code)
      // verificationToken会在useEffect中更新，自动进入reset步骤
    } catch (err) {
      // 错误已在hook中处理
    }
  }

  const handleResetSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await handleChangePassword(formData)
      onSuccess?.()
    } catch (err) {
      // 错误已在hook中处理
    }
  }

  const handleBackToEmail = () => {
    setStep('email')
    setFormData(prev => ({ ...prev, code: '' }))
  }

  const handleBackToVerify = () => {
    setStep('verify')
    setFormData(prev => ({ ...prev, newPassword: '' }))
  }

  return (
    <div className="bg-card rounded-2xl shadow-xl p-8 space-y-6 border border-border">
      {/* Logo/Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Neurix</h1>
        <p className="text-muted-foreground">
          {step === 'email' && '忘记密码'}
          {step === 'verify' && '验证邮箱'}
          {step === 'reset' && '重置密码'}
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          step === 'email' ? 'bg-primary text-primary-foreground' :
          verificationToken ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
        }`}>
          1
        </div>
        <div className={`w-8 h-1 ${
          step === 'verify' || step === 'reset' ? 'bg-primary' : 'bg-muted'
        }`} />
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          step === 'verify' ? 'bg-primary text-primary-foreground' :
          verificationToken ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
        }`}>
          2
        </div>
        <div className={`w-8 h-1 ${step === 'reset' ? 'bg-primary' : 'bg-muted'}`} />
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          step === 'reset' && verificationToken ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        }`}>
          3
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Email Input */}
      {step === 'email' && (
        <form onSubmit={handleEmailSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱地址</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              disabled={sendCodeLoading}
              placeholder="请输入您的邮箱地址"
            />
          </div>

          <Button type="submit" disabled={sendCodeLoading} className="w-full" size="lg">
            {sendCodeLoading ? '发送中...' : '发送验证码'}
          </Button>
        </form>
      )}

      {/* Step 2: Code Verification */}
      {step === 'verify' && (
        <form onSubmit={handleVerifySubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email-display">邮箱地址</Label>
            <Input
              id="email-display"
              type="email"
              value={formData.email}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">验证码</Label>
            <div className="flex space-x-2">
              <Input
                id="code"
                type="text"
                value={formData.code}
                onChange={e => setFormData(prev => ({ ...prev, code: e.target.value }))}
                required
                disabled={verifyCodeLoading}
                placeholder="请输入6位验证码"
                maxLength={6}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSendCode(formData.email)}
                disabled={sendCodeLoading || countdown > 0}
                className="whitespace-nowrap"
              >
                {sendCodeLoading ? '发送中...' : countdown > 0 ? `${countdown}s` : '重发'}
              </Button>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleBackToEmail}
              disabled={verifyCodeLoading}
              className="flex-1"
            >
              上一步
            </Button>
            <Button type="submit" disabled={verifyCodeLoading} className="flex-1" size="lg">
              {verifyCodeLoading ? '验证中...' : '验证验证码'}
            </Button>
          </div>
        </form>
      )}

      {/* Step 3: Password Reset */}
      {step === 'reset' && (
        <form onSubmit={handleResetSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email-final">邮箱地址</Label>
            <Input
              id="email-final"
              type="email"
              value={formData.email}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">新密码</Label>
            <Input
              id="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={e => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
              required
              disabled={loading}
              placeholder="请输入新密码"
              minLength={6}
            />
          </div>

          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleBackToVerify}
              disabled={loading}
              className="flex-1"
            >
              上一步
            </Button>
            <Button type="submit" disabled={loading} className="flex-1" size="lg">
              {loading ? '重置中...' : '重置密码'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}