import { makeAutoObservable } from 'mobx'
import { UserInfo } from '@/service/types/auth'

class UserStore {
  user: UserInfo | null = null
  loading = false
  initialized = false

  constructor() {
    makeAutoObservable(this)
  }
}

// 创建单例 store
export const userStore = new UserStore()

