import { useState, useCallback, useRef } from 'react'
import { sendEmailCode, verifyEmailCode, register } from '@/service/api/auth'
import { SendEmailCodeRequest, VerifyEmailCodeRequest, RegisterRequest } from '@/service/types/auth'
import { showLoginConfirmDialog } from '@/components/common/login-confirm-dialog'

export interface RegisterFormData {
  email: string
  code: string
  password: string
  nickname: string
}

export function useRegister() {
  const [loading, setLoading] = useState(false)
  const [sendCodeLoading, setSendCodeLoading] = useState(false)
  const [verifyCodeLoading, setVerifyCodeLoading] = useState(false)
  const [error, setError] = useState('')
  const [verificationToken, setVerificationToken] = useState<string>('')

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
        const request: SendEmailCodeRequest = { email, scene: 'register' }
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

  // 验证邮箱验证码
  const handleVerifyCode = useCallback(async (email: string, code: string) => {
    if (!email || !code) {
      throw new Error('请输入邮箱和验证码')
    }

    setError('')
    setVerifyCodeLoading(true)

    try {
      const request: VerifyEmailCodeRequest = { email, code, scene: 'register' }
      const response = await verifyEmailCode(request)
      setVerificationToken(response.verificationToken)
      return response.verificationToken
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '验证码验证失败，请重试'
      setError(errorMessage)
      throw err
    } finally {
      setVerifyCodeLoading(false)
    }
  }, [])

  // 用户注册
  const handleRegister = useCallback(
    async (formData: RegisterFormData) => {
      if (!formData.email || !formData.password || !formData.nickname || !formData.code) {
        throw new Error('请填写所有必填字段')
      }

      if (!verificationToken) {
        throw new Error('请先验证邮箱验证码')
      }

      setError('')
      setLoading(true)

      try {
        const request: RegisterRequest = {
          email: formData.email,
          password: formData.password,
          nickname: formData.nickname,
          verificationToken,
        }

        await register(request)

        // 清理状态
        clearCountdown()
        setVerificationToken('')

        // 显示登录确认弹窗
        if (typeof window !== 'undefined') {
          showLoginConfirmDialog('注册成功', '您的账户已成功注册，请登录以开始使用。')
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : '注册失败，请重试'
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [verificationToken, clearCountdown]
  )

  // 清理函数（组件卸载时调用）
  const cleanup = useCallback(() => {
    clearCountdown()
  }, [clearCountdown])

  return {
    loading,
    sendCodeLoading,
    verifyCodeLoading,
    error,
    countdown,
    verificationToken,
    handleSendCode,
    handleVerifyCode,
    handleRegister,
    cleanup,
  }
}
