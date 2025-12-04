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
 * 如果登录：返回该用户可访问的资源（含页面等）
 * 如果未登录：只返回公共资源
 */
export interface AccessibleResourcesResponse {
  accessibleResources: string[] // 可访问的资源标识（页面路径等）
}
