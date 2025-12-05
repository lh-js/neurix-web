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
