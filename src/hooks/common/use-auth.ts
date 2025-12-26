import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { runInAction } from 'mobx'
import { userStore } from '@/stores/user-store'
import { getUserInfo, logout, getAccessibleResources } from '@/service/api/auth'
import { isAuthenticated, isNetworkError } from '@/utils/auth.util'
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
    // 如果正在加载中，避免重复请求
    if (userStore.pagesLoading) {
      return
    }

    runInAction(() => {
      userStore.pagesLoading = true
    })

    try {
      const response = await getAccessibleResources()
      // 完全按照接口返回的来，不添加额外的页面
      const pages = [...(response.accessiblePages || [])]
      const elements = response.accessibleElements || []
      runInAction(() => {
        userStore.accessiblePages = pages
        userStore.accessibleElements = elements
        userStore.pagesLoading = false
        userStore.pagesInitialized = true
        // 成功获取资源后清除网络错误状态
        userStore.networkError = false
      })
    } catch (error) {
      console.error('获取可访问资源失败:', error)

      // 检测是否是网络错误
      if (isNetworkError(error)) {
        runInAction(() => {
          userStore.networkError = true
          // 网络错误时，只保留网络错误页面，其他页面都不能访问
          userStore.accessiblePages = ['/network-error']
          userStore.accessibleElements = []
          userStore.pagesLoading = false
          // 网络错误时，保持 pagesInitialized 为 true，避免重复请求
          userStore.pagesInitialized = true
        })
      } else {
        // 非网络错误，接口失败时，不设置任何可访问页面
        // 用户将无法访问任何页面（除了系统自动跳转的页面）
        runInAction(() => {
          userStore.networkError = false
          userStore.accessiblePages = []
          userStore.accessibleElements = []
          userStore.pagesLoading = false
          userStore.pagesInitialized = true
        })
      }
    }
  }

  // 自动初始化（只在客户端调用，且只初始化一次）
  useEffect(() => {
    if ((userStore.initialized && userStore.pagesInitialized) || typeof window === 'undefined') {
      return
    }

    // 如果已经在网络错误页面，且 URL 中有 redirect 参数，说明是从其他页面跳转过来的
    // 此时不应该自动请求，等待用户手动重试或网络恢复
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname
      const urlParams = new URLSearchParams(window.location.search)
      const hasRedirect = urlParams.has('redirect')

      if (currentPath === '/network-error' && hasRedirect) {
        // 在网络错误页面，如果有 redirect 参数，不自动请求
        // 直接设置 pagesInitialized 为 true，避免重复请求
        runInAction(() => {
          userStore.initialized = true
          userStore.pagesInitialized = true
        })
        return
      }
    }

    runInAction(() => {
      userStore.initialized = true
      userStore.pagesInitialized = true
    })

    // 页面加载时获取一次可访问资源（无论是否登录）
    fetchAccessibleResources()

    // 如果有 token 且还没有用户信息，自动获取用户信息（页面刷新后也能保持）
    // 如果已经有用户信息，说明已经获取过了，不需要重复获取
    if (isAuthenticated() && !userStore.user) {
      fetchUserInfo()
    }
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
      // 直接跳转到登录页，不显示弹窗
      window.location.href = LOGIN_PATH
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
    networkError: userStore.networkError,
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
