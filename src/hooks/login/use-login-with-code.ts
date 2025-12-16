import { useState, useCallback, useRef } from 'react'
import { sendEmailCode, verifyEmailCode, loginWithToken } from '@/service/api/auth'
import {
  SendEmailCodeRequest,
  VerifyEmailCodeRequest,
  LoginWithTokenRequest,
} from '@/service/types/auth'
import { setToken } from '@/utils/auth.util'

/**
 * 获取URL中的查询参数
 */
function getQueryParam(param: string): string | null {
  if (typeof window === 'undefined') return null
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(param)
}

export interface LoginWithCodeFormData {
  email: string
  code: string
  rememberMe: boolean
}

export function useLoginWithCode() {
  const [loading, setLoading] = useState(false)
  const [sendCodeLoading, setSendCodeLoading] = useState(false)
  const [error, setError] = useState('')

  // 验证码倒计时
  const [countdown, setCountdown] = useState(0)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  // 开始倒计时
  const startCountdown = useCallback(() => {
    setCountdown(60)
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current)
            countdownRef.current = null
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  // 清理倒计时
  const clearCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
    setCountdown(0)
  }, [])

  // 发送邮箱验证码
  const handleSendCode = useCallback(
    async (email: string) => {
      if (!email) {
        throw new Error('请输入邮箱地址')
      }

      setError('')
      setSendCodeLoading(true)

      try {
        const request: SendEmailCodeRequest = { email, scene: 'login' }
        await sendEmailCode(request)
        startCountdown()
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : '发送验证码失败，请重试'
        setError(errorMessage)
        throw err
      } finally {
        setSendCodeLoading(false)
      }
    },
    [startCountdown]
  )

  // 使用验证码登录（先验证验证码，然后登录）
  const handleLogin = useCallback(
    async (formData: LoginWithCodeFormData) => {
      if (!formData.email || !formData.code) {
        throw new Error('请填写所有必填字段')
      }

      setError('')
      setLoading(true)

      try {
        // 先验证验证码获取 verificationToken
        const verifyRequest: VerifyEmailCodeRequest = {
          email: formData.email,
          code: formData.code,
          scene: 'login',
        }
        const verifyResponse = await verifyEmailCode(verifyRequest)

        // 使用 verificationToken 登录
        const loginRequest: LoginWithTokenRequest = {
          email: formData.email,
          verificationToken: verifyResponse.verificationToken,
        }

        const response = await loginWithToken(loginRequest)

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

        // 清理状态
        clearCountdown()

        // 跳转到来源页面或默认页面
        if (typeof window !== 'undefined') {
          const redirectTo = getQueryParam('redirect') || '/'
          window.location.href = redirectTo
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : '登录失败，请重试'
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [clearCountdown]
  )

  // 清理函数（组件卸载时调用）
  const cleanup = useCallback(() => {
    clearCountdown()
  }, [clearCountdown])

  return {
    loading,
    sendCodeLoading,
    error,
    countdown,
    handleSendCode,
    handleLogin,
    cleanup,
  }
}
