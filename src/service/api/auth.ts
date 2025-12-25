import { post, get } from '../request'
import { getToken, clearAuth } from '@/utils/auth.util'
import { showLoginConfirmDialog } from '@/components/common/login-confirm-dialog'
import {
  LoginRequest,
  LoginResponse,
  LoginWithTokenRequest,
  LoginWithTokenResponse,
  UserInfo,
  AccessibleResourcesResponse,
  SendEmailCodeRequest,
  SendEmailCodeResponse,
  VerifyEmailCodeRequest,
  VerifyEmailCodeResponse,
  RegisterRequest,
  RegisterResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  AIChatRequest,
  AIChatResponse,
} from '../types/auth'

/**
 * 登录 API
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await post<LoginResponse>('/auth/login', data)
  return response
}

/**
 * 使用验证码登录 API
 */
export async function loginWithToken(data: LoginWithTokenRequest): Promise<LoginWithTokenResponse> {
  const response = await post<LoginWithTokenResponse>('/auth/login-with-token', data)
  return response
}

/**
 * 登出（清除本地 token）
 */
export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
  }
}

/**
 * 获取用户信息 API
 */
export async function getUserInfo(): Promise<UserInfo> {
  const response = await get<UserInfo>('/auth/user-info')
  return response
}

/**
 * 获取可访问资源 API
 */
export async function getAccessibleResources(): Promise<AccessibleResourcesResponse> {
  const response = await get<AccessibleResourcesResponse>('/auth/accessible-resources')
  return response
}

/**
 * 发送邮箱验证码 API
 */
export async function sendEmailCode(data: SendEmailCodeRequest): Promise<SendEmailCodeResponse> {
  const response = await post<SendEmailCodeResponse>('/email-code/send-code', data)
  return response
}

/**
 * 验证邮箱验证码 API
 */
export async function verifyEmailCode(
  data: VerifyEmailCodeRequest
): Promise<VerifyEmailCodeResponse> {
  const response = await post<VerifyEmailCodeResponse>('/email-code/verify-code', data)
  return response
}

/**
 * 用户注册 API
 */
export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await post<RegisterResponse>('/user/register', data)
  return response
}

/**
 * 修改密码 API
 */
export async function changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
  const response = await post<ChangePasswordResponse>('/user/change-password', data)
  return response
}

/**
 * AI聊天（非流式）
 */
export async function aiChat(data: AIChatRequest): Promise<AIChatResponse> {
  const response = await post<{ content: string }>('/ai/chat', data)

  // 构造完整的AIChatResponse格式
  return {
    id: '',
    object: 'chat.completion',
    created: Date.now(),
    model: '',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: response.content,
        },
        finish_reason: 'stop',
      },
    ],
    usage: {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    },
  }
}

/**
 * AI聊天（流式）
 */
export async function aiChatStream(
  data: AIChatRequest,
  onMessage?: (chunk: string) => void,
  onComplete?: (fullResponse: AIChatResponse) => void
): Promise<void> {
  const token = typeof window !== 'undefined' ? getToken() : ''

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || '/api'}/ai/chat-stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(data),
  })

  // 单独处理未授权（流式不经过全局拦截器）
  if (response.status === 401) {
    clearAuth()
    if (typeof window !== 'undefined') {
      showLoginConfirmDialog('登录已过期', '您的登录状态已过期，请重新登录以继续使用聊天功能。')
    }
    throw new Error('未登录或登录已过期')
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('Response body is not readable')
  }

  const decoder = new TextDecoder()
  let buffer = ''
  let fullContent = ''

  try {
    let done = false
    while (!done) {
      const { done: readerDone, value } = await reader.read()
      if (readerDone) {
        done = true
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmedLine = line.trim()
        if (!trimmedLine) continue

        // 处理SSE格式：data: {"content":"..."}
        if (trimmedLine.startsWith('data: ')) {
          const data = trimmedLine.slice(6) // 移除 'data: ' 前缀
          if (data === '[DONE]') {
            // 流结束
            break
          }

          try {
            const parsed = JSON.parse(data) as { content: string }
            const content = parsed.content || ''

            // 直接将content作为增量内容
            if (content && onMessage) {
              onMessage(content)
            }

            // 累积完整内容
            fullContent += content
          } catch (e) {
            console.error('Parse error:', e, 'Raw data:', data)
            // 忽略解析错误
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  // 流结束时调用完成回调
  if (onComplete) {
    onComplete({
      id: '',
      object: '',
      created: Date.now(),
      model: '',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: fullContent,
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
    })
  }
}
