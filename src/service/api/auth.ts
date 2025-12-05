import { post, get } from '../request'
import {
  LoginRequest,
  LoginResponse,
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
} from '../types/auth'

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
