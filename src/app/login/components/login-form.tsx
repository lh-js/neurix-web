'use client'

import { useState, FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface LoginFormProps {
  onSubmit: (data: { email: string; password: string; rememberMe: boolean }) => Promise<void>
  loading: boolean
  error: string
}

export function LoginForm({ onSubmit, loading, error }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await onSubmit({ email, password, rememberMe })
  }

  return (
    <div className="bg-card rounded-2xl shadow-xl p-8 space-y-6 border border-border">
      {/* Logo/Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Neurix</h1>
        <p className="text-muted-foreground">管理员登录</p>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Input */}
        <div className="space-y-2">
          <Label htmlFor="email">邮箱</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={loading}
            placeholder="请输入邮箱地址"
          />
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <Label htmlFor="password">密码</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={loading}
            placeholder="请输入密码"
          />
        </div>

        {/* Remember Me */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={checked => setRememberMe(checked === true)}
            disabled={loading}
          />
          <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
            记住我
          </Label>
        </div>

        {/* Submit Button */}
        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? '登录中...' : '登录'}
        </Button>
      </form>
    </div>
  )
}
