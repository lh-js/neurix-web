import { useState } from 'react'
import { login } from '@/service/api/auth'
import { setTokens } from '@/utils/auth.util'

/**
 * 获取URL中的查询参数
 */
function getQueryParam(param: string): string | null {
  if (typeof window === 'undefined') return null
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(param)
}

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
      // 保存 tokens（accessToken 和 refreshToken）
      setTokens(response.accessToken, response.refreshToken, formData.rememberMe)

      // 验证 token 是否已保存
      if (typeof window !== 'undefined') {
        const savedToken = formData.rememberMe
          ? localStorage.getItem('token')
          : sessionStorage.getItem('token')

        if (!savedToken) {
          throw new Error('Token 保存失败，请重试')
        }
      }

      // 跳转到来源页面或默认页面
      // 使用 window.location.href 强制刷新页面，页面刷新后会自动获取用户信息和可访问页面
      // 这样避免重复调用接口
      if (typeof window !== 'undefined') {
        // 从URL参数获取重定向地址，如果没有则默认为/
        const redirectTo = getQueryParam('redirect') || '/'
        window.location.href = redirectTo
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
