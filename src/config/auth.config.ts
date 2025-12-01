/**
 * 认证配置
 * 可配置登录前后可访问的页面
 */

// 登录后可以访问的页面（需要登录）
export const protectedRoutes = [
  '/admin',
  '/admin/dashboard',
  // 可以在这里添加更多需要登录的页面
]

// 登录后默认跳转的页面
export const DEFAULT_LOGIN_REDIRECT = '/admin'

// 登录页面路径
export const LOGIN_PATH = '/login'

// 不显示 header 和 footer 的页面（这些页面会使用最小化布局）
export const minimalLayoutRoutes = [
  '/login',
  // 可以在这里添加更多不需要 header/footer 的页面
]

/**
 * 检查路径是否应该使用最小化布局（不显示 header 和 footer）
 */
export function isMinimalLayoutRoute(pathname: string): boolean {
  return minimalLayoutRoutes.some(route => {
    if (route === pathname) return true
    // 支持通配符匹配
    if (route.endsWith('*')) {
      const prefix = route.slice(0, -1)
      return pathname.startsWith(prefix)
    }
    return false
  })
}

/**
 * 检查路径是否为受保护路由
 */
export function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => {
    if (route === pathname) return true
    // 支持通配符匹配
    if (route.endsWith('*')) {
      const prefix = route.slice(0, -1)
      return pathname.startsWith(prefix)
    }
    return false
  })
}

/**
 * 检查路径是否应该显示侧边栏（管理员页面）
 * 只有 /admin 开头的页面才显示侧边栏
 */
export function shouldShowSidebar(pathname: string): boolean {
  return pathname.startsWith('/admin')
}


