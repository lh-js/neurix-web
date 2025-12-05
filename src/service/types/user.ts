/**
 * 用户信息
 */
export interface User {
  id: number
  email: string
  nickname: string
  role: number // 角色ID
  tokens: number
  usage: number
  createTime?: string
}

/**
 * 创建用户请求参数
 */
export interface CreateUserRequest {
  email: string
  nickname: string
  password: string
  role: number
}

/**
 * 更新用户请求参数
 */
export interface UpdateUserRequest {
  email?: string
  nickname?: string
  role?: number
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

/**
 * 管理员修改密码请求参数
 */
export interface AdminChangePasswordRequest {
  userId: number
  newPassword: string
}

/**
 * 管理员修改密码响应数据
 */
export interface AdminChangePasswordResponse {
  message: string
}
