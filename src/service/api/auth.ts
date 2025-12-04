import { post, get } from '../request'
import { LoginRequest, LoginResponse, UserInfo, AccessibleResourcesResponse } from '../types/auth'

/**
 * 登录 API
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await post<LoginResponse>('/auth/login', data)
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
