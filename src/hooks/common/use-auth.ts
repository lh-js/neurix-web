import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { runInAction } from 'mobx'
import { userStore } from '@/stores/user-store'
import { getUserInfo, logout, getAccessibleResources } from '@/service/api/auth'
import { isAuthenticated } from '@/utils/auth.util'
import { LOGIN_PATH } from '@/config/auth.config'

/**
 * 使用用户 store 的 Hook
 * 提供用户数据和业务逻辑方法
 * 自动初始化用户信息（只在客户端，且只初始化一次）
 */
export function useAuth() {
  // 获取用户信息
  const fetchUserInfo = async () => {
    if (!isAuthenticated()) {
      runInAction(() => {
        userStore.user = null
        userStore.loading = false
      })
      return
    }

    // 设置 loading 状态
    runInAction(() => {
      userStore.loading = true
    })

    try {
      const userInfo = await getUserInfo()
      runInAction(() => {
        userStore.user = userInfo
        userStore.loading = false
      })
    } catch (error) {
      // 获取用户信息失败，只更新状态
      // token 清除由全局请求拦截器处理（401 错误时）
      // 网络错误等其他错误不应该清除 token
      console.error('获取用户信息失败:', error)
      runInAction(() => {
        userStore.user = null
        userStore.loading = false
      })
    }
  }

  // 刷新用户信息
  const refreshUserInfo = async () => {
    runInAction(() => {
      userStore.loading = true
    })
    await fetchUserInfo()
  }

  // 获取可访问资源（无论是否登录都会请求）
  const fetchAccessibleResources = async () => {
    runInAction(() => {
      userStore.pagesLoading = true
    })

    try {
      const response = await getAccessibleResources()
      const pages = [...(response.accessiblePages || [])]
      const elements = response.accessibleElements || []
      if (!pages.includes(LOGIN_PATH)) {
        pages.push(LOGIN_PATH)
      }
      // 添加根路径/作为保底页面
      if (!pages.includes('/')) {
        pages.push('/')
      }
      runInAction(() => {
        userStore.accessiblePages = pages
        userStore.accessibleElements = elements
        userStore.pagesLoading = false
      })
    } catch (error) {
      console.error('获取可访问资源失败:', error)
      // 即使接口失败，也至少保证 login 页面和根页面可访问
      runInAction(() => {
        userStore.accessiblePages = [LOGIN_PATH, '/']
        userStore.accessibleElements = []
        userStore.pagesLoading = false
      })
    }
  }

  // 自动初始化（只在客户端调用，且只初始化一次）
  useEffect(() => {
    if (userStore.initialized || typeof window === 'undefined') {
      return
    }

    runInAction(() => {
      userStore.initialized = true
    })

    // 如果有 token 且还没有用户信息，自动获取用户信息（页面刷新后也能保持）
    // 如果已经有用户信息，说明已经获取过了，不需要重复获取
    if (isAuthenticated() && !userStore.user) {
      fetchUserInfo()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 自动获取可访问资源（只在客户端调用，且只初始化一次，无论是否登录都会请求）
  useEffect(() => {
    if (userStore.pagesInitialized || typeof window === 'undefined') {
      return
    }

    runInAction(() => {
      userStore.pagesInitialized = true
    })

    // 页面加载时获取一次可访问资源（无论是否登录）
    fetchAccessibleResources()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 登出
  const handleLogout = () => {
    logout()
    runInAction(() => {
      userStore.user = null
      userStore.accessiblePages = []
      userStore.accessibleElements = []
      userStore.pagesInitialized = false
    })
    if (typeof window !== 'undefined') {
      // 记录当前页面作为重定向参数
      const currentPath = window.location.pathname
      const redirectUrl = currentPath !== LOGIN_PATH ? `${LOGIN_PATH}?redirect=${encodeURIComponent(currentPath)}` : LOGIN_PATH
      window.location.href = redirectUrl
    }
  }

  return {
    user: userStore.user,
    loading: userStore.loading,
    initialized: userStore.initialized,
    accessiblePages: userStore.accessiblePages,
    accessibleElements: userStore.accessibleElements,
    pagesLoading: userStore.pagesLoading,
    pagesInitialized: userStore.pagesInitialized,
    fetchUserInfo,
    refreshUserInfo,
    fetchAccessibleResources,
    logout: handleLogout,
  }
}

/**
 * 观察用户 store 的 HOC
 * 用于组件自动响应 store 变化
 */
export const withUser = observer
