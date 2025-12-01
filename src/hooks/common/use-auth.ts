import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { runInAction } from 'mobx'
import { userStore } from '@/stores/user-store'
import { getUserInfo, logout } from '@/service/api/auth'
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

  // 登出
  const handleLogout = () => {
    logout()
    runInAction(() => {
      userStore.user = null
    })
    if (typeof window !== 'undefined') {
      window.location.href = LOGIN_PATH
    }
  }

  return {
    user: userStore.user,
    loading: userStore.loading,
    initialized: userStore.initialized,
    fetchUserInfo,
    refreshUserInfo,
    logout: handleLogout,
  }
}

/**
 * 观察用户 store 的 HOC
 * 用于组件自动响应 store 变化
 */
export const withUser = observer
