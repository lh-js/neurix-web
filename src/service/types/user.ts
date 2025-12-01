/**
 * 用户信息
 */
export interface User {
  id: number
  email: string
  nickname: string
  role: number // 0: 普通用户, 1: 管理员
  tokens: number
  usage: number
}

/**
 * 用户列表查询参数
 */
export interface UserListParams {
  page: number
  pageSize: number
}

/**
 * 用户列表响应数据
 */
export interface UserListResponse {
  list: User[]
  total: number
  page: string
  pageSize: string
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}
