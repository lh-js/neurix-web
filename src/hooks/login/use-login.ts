import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/service/api/auth'
import { setToken } from '@/utils/auth.util'
import { DEFAULT_LOGIN_REDIRECT } from '@/config/auth.config'
import { useUser } from '@/hooks/common/use-user'

interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
}

export function useLogin() {
  const router = useRouter()
  const { refreshUserInfo } = useUser()
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
      setToken(response.access_token, formData.rememberMe)
      
      // 验证 token 是否已保存
      if (typeof window !== 'undefined') {
        const savedToken = formData.rememberMe 
          ? localStorage.getItem('token')
          : sessionStorage.getItem('token')
        
        if (!savedToken) {
          throw new Error('Token 保存失败，请重试')
        }
      }
      
      // 获取用户信息
      await refreshUserInfo()
      // 跳转到默认页面
      router.push(DEFAULT_LOGIN_REDIRECT)
      router.refresh()
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

