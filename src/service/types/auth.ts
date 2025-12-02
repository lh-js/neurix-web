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
