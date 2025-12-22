'use client'

import { useState, useEffect, useMemo, FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useLoginWithCode, LoginWithCodeFormData } from '@/hooks/login/use-login-with-code'

interface LoginFormProps {
  onSubmit: (data: { email: string; password: string; rememberMe: boolean }) => Promise<void>
  loading: boolean
  error: string
}

type LoginMode = 'password' | 'code'

export function LoginForm({ onSubmit, loading, error }: LoginFormProps) {
  const [loginMode, setLoginMode] = useState<LoginMode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  // 验证码登录相关
  const {
    loading: codeLoginLoading,
    sendCodeLoading,
    error: codeLoginError,
    countdown,
    handleSendCode,
    handleLogin: handleCodeLogin,
    cleanup,
  } = useLoginWithCode()

  const [codeFormData, setCodeFormData] = useState<LoginWithCodeFormData>({
    email: '',
    code: '',
    rememberMe: false,
  })

  // 跟踪验证码是否已发送
  const [codeSent, setCodeSent] = useState(false)

  // 计算验证码登录的当前步骤
  const codeStep = useMemo(() => {
    if (codeSent) return 'login'
    return 'email'
  }, [codeSent])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  // 切换登录方式
  const handleModeChange = (mode: LoginMode) => {
    if (mode === 'password' && loginMode === 'code') {
      // 从验证码登录切换到密码登录时，重置验证码相关状态
      setCodeFormData({ email: '', code: '', rememberMe: false })
      setCodeSent(false)
      cleanup()
    }
    setLoginMode(mode)
  }

  // 密码登录提交
  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await onSubmit({ email, password, rememberMe })
  }

  // 验证码登录 - 发送验证码
  const handleEmailSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await handleSendCode(codeFormData.email)
      setCodeSent(true)
    } catch {
      // 错误已在hook中处理
    }
  }

  // 验证码登录 - 输入验证码并登录
  const handleCodeLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await handleCodeLogin(codeFormData)
    } catch {
      // 错误已在hook中处理
    }
  }

  const handleBackToEmail = () => {
    setCodeFormData(prev => ({ ...prev, code: '' }))
    setCodeSent(false)
  }

  // 显示的错误信息（优先显示验证码登录的错误）
  const displayError = loginMode === 'code' ? codeLoginError : error
  // 显示的加载状态
  const displayLoading = loginMode === 'code' ? codeLoginLoading : loading

  return (
    <div className="bg-card rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 space-y-6 sm:space-y-8 border border-border">
      {/* Logo/Title */}
      <div className="text-center space-y-2 sm:space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Neurix</h1>
      </div>

      {/* 登录方式切换 */}
      <div className="relative">
        <div className="flex space-x-1 bg-muted/50 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => handleModeChange('password')}
            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
              loginMode === 'password'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            密码登录
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('code')}
            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
              loginMode === 'code'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            验证码登录
          </button>
        </div>
      </div>

      {/* Error Message */}
      {displayError && (
        <Alert variant="destructive" className="animate-in fade-in-0">
          <AlertDescription>{displayError}</AlertDescription>
        </Alert>
      )}

      {/* 密码登录表单 */}
      {loginMode === 'password' && (
        <form
          onSubmit={handlePasswordSubmit}
          className="space-y-6 animate-in fade-in-0 slide-in-from-top-2 duration-300"
        >
          {/* Email Input */}
          <div className="space-y-2.5">
            <Label htmlFor="email" className="text-sm font-medium">
              邮箱
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={displayLoading}
              placeholder="请输入邮箱地址"
              className="h-11"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2.5">
            <Label htmlFor="password" className="text-sm font-medium">
              密码
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={displayLoading}
              placeholder="请输入密码"
              className="h-11"
            />
          </div>

          {/* Remember Me */}
          <div className="flex items-center space-x-2.5">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={checked => setRememberMe(checked === true)}
              disabled={displayLoading}
            />
            <Label
              htmlFor="remember"
              className="text-sm font-normal cursor-pointer text-muted-foreground"
            >
              记住我
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={displayLoading}
            className="w-full h-11 text-base font-medium"
            size="lg"
          >
            {displayLoading ? '登录中...' : '登录'}
          </Button>
        </form>
      )}

      {/* 验证码登录表单 */}
      {loginMode === 'code' && (
        <div className="animate-in fade-in-0 slide-in-from-top-2 duration-300">
          {/* Step 1: 发送验证码 */}
          {codeStep === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="space-y-2.5">
                <Label htmlFor="code-email" className="text-sm font-medium">
                  邮箱地址
                </Label>
                <Input
                  id="code-email"
                  type="email"
                  value={codeFormData.email}
                  onChange={e => setCodeFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  disabled={sendCodeLoading}
                  placeholder="请输入邮箱地址"
                  className="h-11"
                />
              </div>

              <Button
                type="submit"
                disabled={sendCodeLoading}
                className="w-full h-11 text-base font-medium"
                size="lg"
              >
                {sendCodeLoading ? '发送中...' : '发送验证码'}
              </Button>
            </form>
          )}

          {/* Step 2: 输入验证码并登录 */}
          {codeStep === 'login' && (
            <form onSubmit={handleCodeLoginSubmit} className="space-y-6">
              <div className="space-y-2.5">
                <Label htmlFor="code-email-display" className="text-sm font-medium">
                  邮箱地址
                </Label>
                <Input
                  id="code-email-display"
                  type="email"
                  value={codeFormData.email}
                  disabled
                  className="bg-muted h-11"
                />
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="code" className="text-sm font-medium">
                  验证码
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    type="text"
                    value={codeFormData.code}
                    onChange={e => setCodeFormData(prev => ({ ...prev, code: e.target.value }))}
                    required
                    disabled={codeLoginLoading}
                    placeholder="请输入6位验证码"
                    maxLength={6}
                    className="h-11 flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSendCode(codeFormData.email)}
                    disabled={sendCodeLoading || countdown > 0}
                    className="whitespace-nowrap h-11 px-4"
                  >
                    {sendCodeLoading ? '发送中...' : countdown > 0 ? `${countdown}s` : '重发'}
                  </Button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2.5">
                <Checkbox
                  id="code-remember"
                  checked={codeFormData.rememberMe}
                  onCheckedChange={checked =>
                    setCodeFormData(prev => ({ ...prev, rememberMe: checked === true }))
                  }
                  disabled={codeLoginLoading}
                />
                <Label
                  htmlFor="code-remember"
                  className="text-sm font-normal cursor-pointer text-muted-foreground"
                >
                  记住我
                </Label>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackToEmail}
                  disabled={codeLoginLoading}
                  className="flex-1 h-11"
                >
                  上一步
                </Button>
                <Button
                  type="submit"
                  disabled={codeLoginLoading}
                  className="flex-1 h-11 text-base font-medium"
                  size="lg"
                >
                  {codeLoginLoading ? '登录中...' : '登录'}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
