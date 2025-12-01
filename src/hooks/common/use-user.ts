import { observer } from 'mobx-react-lite'
import { runInAction } from 'mobx'
import { userStore } from '@/stores/user-store'
import { getUserInfo, logout as clearAuth } from '@/service/api/auth'
import { isAuthenticated } from '@/utils/auth.util'
import { LOGIN_PATH } from '@/config/auth.config'

/**
 * 使用用户 store 的 Hook
 * 提供用户数据和业务逻辑方法
 */
export function useUser() {
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
      // 如果获取用户信息失败，清除 token
      console.error('获取用户信息失败:', error)
      runInAction(() => {
        userStore.user = null
        userStore.loading = false
      })
      clearAuth()
    }
  }

  // 刷新用户信息
  const refreshUserInfo = async () => {
    runInAction(() => {
      userStore.loading = true
    })
    await fetchUserInfo()
  }

  // 初始化 store（只在客户端调用）
  const init = () => {
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
  }

  // 登出
  const logout = () => {
    clearAuth()
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
    init,
    fetchUserInfo,
    refreshUserInfo,
    logout,
  }
}

/**
 * 观察用户 store 的 HOC
 * 用于组件自动响应 store 变化
 */
export const withUser = observer

