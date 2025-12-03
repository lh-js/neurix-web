/**
 * 页面权限
 */
export interface RolePage {
  id: number
  url: string
  description: string
  isPublic: boolean
  createTime?: string
}

/**
 * 创建页面权限请求参数
 */
export interface CreateRolePageRequest {
  url: string
  description: string
  isPublic: boolean
}

/**
 * 更新页面权限请求参数
 */
export interface UpdateRolePageRequest {
  url?: string
  description?: string
  isPublic?: boolean
}

/**
 * 页面权限列表查询参数
 */
export interface RolePageListParams {
  page: number
  pageSize: number
  isPublic?: boolean
}

/**
 * 页面权限列表响应数据
 */
export interface RolePageListResponse {
  list: RolePage[]
  total: number
  page: string
  pageSize: string
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

