import { useState } from 'react'
import { login } from '@/service/api/auth'
import { setToken } from '@/utils/auth.util'
import { DEFAULT_LOGIN_REDIRECT } from '@/config/auth.config'

interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
}

export function useLogin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (formData: LoginFormData) => {
    setError('')
    setLoading(true)

    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
      })
      // 保存 token
      setToken(response.accessToken, formData.rememberMe)

      // 验证 token 是否已保存
      if (typeof window !== 'undefined') {
        const savedToken = formData.rememberMe
          ? localStorage.getItem('token')
          : sessionStorage.getItem('token')

        if (!savedToken) {
          throw new Error('Token 保存失败，请重试')
        }
      }

      // 跳转到默认页面
      // 使用 window.location.href 强制刷新页面，页面刷新后会自动获取用户信息和可访问页面
      // 这样避免重复调用接口
      if (typeof window !== 'undefined') {
        window.location.href = DEFAULT_LOGIN_REDIRECT
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '登录失败，请检查邮箱和密码'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    handleLogin,
  }
}
