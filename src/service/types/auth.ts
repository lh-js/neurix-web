/**
 * 登录请求参数
 */
export interface LoginRequest {
  email: string
  password: string
}

/**
 * 登录响应数据
 */
export interface LoginResponse {
  accessToken: string
}

/**
 * 用户信息
 */
export interface UserInfo {
  email: string
  nickname: string
  tokens: number
  usage: number
}

/**
 * 可访问资源响应数据
 * 如果登录：返回该用户可访问的资源（含页面、元素等）
 * 如果未登录：只返回公共资源
 */
export interface AccessibleResourcesResponse {
  accessiblePages: string[] // 可访问的页面路径（包含公共页面）
  accessibleElements: string[] // 可访问的元素标识（可选）
}

/**
 * 发送邮箱验证码请求参数
 */
export interface SendEmailCodeRequest {
  email: string
  scene: 'register' | 'forgotPassword'
}

/**
 * 发送邮箱验证码响应数据
 */
export interface SendEmailCodeResponse {
  message: string
}

/**
 * 验证邮箱验证码请求参数
 */
export interface VerifyEmailCodeRequest {
  email: string
  code: string
  scene: 'register' | 'forgotPassword'
}

/**
 * 验证邮箱验证码响应数据
 */
export interface VerifyEmailCodeResponse {
  verificationToken: string
}

/**
 * 用户注册请求参数
 */
export interface RegisterRequest {
  email: string
  password: string
  nickname: string
  verificationToken: string
}

/**
 * 用户注册响应数据
 */
export interface RegisterResponse {
  message: string
}

/**
 * 修改密码请求参数
 */
export interface ChangePasswordRequest {
  email: string
  newPassword: string
  verificationToken: string
}

/**
 * 修改密码响应数据
 */
export interface ChangePasswordResponse {
  message: string
}

/**
 * AI聊天请求参数
 */
export interface AIChatRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
  }>
  model?: string
  stream?: boolean
}

/**
 * AI聊天响应数据
 */
export interface AIChatResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string | null
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

/**
 * 聊天消息
 */
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}
