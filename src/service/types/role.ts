/**
 * 角色/权限
 */
export interface Role {
  id: number
  name: string
  description: string
  level: number
  accessiblePages: string[] | null
  accessibleApis: string[] | null
  createTime: string
}

/**
 * 创建角色请求参数
 */
export interface CreateRoleRequest {
  name: string
  description: string
  level: number
  accessiblePages: string[]
  accessibleApis: string[]
}

/**
 * 更新角色请求参数
 */
export interface UpdateRoleRequest {
  name?: string
  description?: string
  level?: number
  accessiblePages?: string[]
  accessibleApis?: string[]
}

/**
 * 角色列表查询参数
 */
export interface RoleListParams {
  page: number
  pageSize: number
}

/**
 * 角色列表响应数据
 */
export interface RoleListResponse {
  list: Role[]
  total: number
  page: string
  pageSize: string
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}
