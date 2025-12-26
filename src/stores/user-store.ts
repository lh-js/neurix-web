import { makeAutoObservable } from 'mobx'
import { UserInfo } from '@/service/types/auth'

class UserStore {
  user: UserInfo | null = null
  loading = false
  initialized = false
  accessiblePages: string[] = []
  accessibleElements: string[] = []
  pagesLoading = false
  pagesInitialized = false
  networkError = false

  constructor() {
    makeAutoObservable(this)
  }
}

// 创建单例 store
export const userStore = new UserStore()
