import { LOGIN_PATH } from '@/config/auth.config'
import { isClient } from './env.util'

/**
 * 获取 token
 */
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || sessionStorage.getItem('token')
  }
  return null
}

/**
 * 保存 token
 */
export function setToken(token: string, rememberMe = false): void {
  if (typeof window !== 'undefined') {
    // 先清除旧的 token
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
    // 保存新的 token
    if (rememberMe) {
      localStorage.setItem('token', token)
    } else {
      sessionStorage.setItem('token', token)
    }
  }
}

/**
 * 检查是否已登录
 */
export function isAuthenticated(): boolean {
  return getToken() !== null
}

// 辅助函数：清除认证信息
export const clearAuth = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
  }
}

/**
 * 构建带来源信息的登录链接
 * 默认使用当前页面的完整路径（包含查询与 hash）
 */
export const buildLoginRedirectUrl = (from?: string): string => {
  const currentPath =
    from ||
    (isClient ? `${window.location.pathname}${window.location.search}${window.location.hash}` : '')

  if (!currentPath) {
    return LOGIN_PATH
  }

  // 已经在登录页时不重复追加 redirect 参数，避免循环跳转
  if (currentPath === LOGIN_PATH || currentPath.startsWith(`${LOGIN_PATH}?`)) {
    return LOGIN_PATH
  }

  return `${LOGIN_PATH}?redirect=${encodeURIComponent(currentPath)}`
}

/**
 * 检查用户是否有权限访问指定页面
 * @param pathname 页面路径
 * @param accessiblePages 用户可访问的页面列表
 * @returns 是否有权限访问
 */
export function canAccessPage(
  pathname: string,
  accessiblePages: string[] | null | undefined
): boolean {
  // 如果没有可访问页面列表，默认不允许访问
  if (!accessiblePages || accessiblePages.length === 0) {
    return false
  }

  // 只做精确匹配
  return accessiblePages.includes(pathname)
}
