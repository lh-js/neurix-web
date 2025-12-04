/**
 * 元素权限
 */
export interface RoleElement {
  id: number
  name: string
  key: string
  description: string
  createTime?: string
}

/**
 * 创建元素权限请求参数
 */
export interface CreateRoleElementRequest {
  name: string
  key: string
  description: string
}

/**
 * 更新元素权限请求参数
 */
export interface UpdateRoleElementRequest {
  name?: string
  key?: string
  description?: string
}

/**
 * 元素权限列表查询参数
 */
export interface RoleElementListParams {
  page: number
  pageSize: number
}

/**
 * 元素权限列表响应数据
 */
export interface RoleElementListResponse {
  list: RoleElement[]
  total: number
  page: string
  pageSize: string
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}
