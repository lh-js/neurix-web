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
