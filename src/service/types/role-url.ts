/**
 * 权限URL类型
 */
export type RoleUrlType = 0 | 1 // 0: 页面, 1: 接口

/**
 * 权限URL
 */
export interface RoleUrl {
  id: number
  url: string
  description: string
  type: RoleUrlType
  isPublic: boolean
  createTime?: string
}

/**
 * 创建权限URL请求参数
 */
export interface CreateRoleUrlRequest {
  url: string
  description: string
  type: RoleUrlType
  isPublic: boolean
}

/**
 * 更新权限URL请求参数
 */
export interface UpdateRoleUrlRequest {
  url?: string
  description?: string
  type?: RoleUrlType
  isPublic?: boolean
}

/**
 * 权限URL列表查询参数
 */
export interface RoleUrlListParams {
  page: number
  pageSize: number
  type?: RoleUrlType
  isPublic?: boolean
}

/**
 * 权限URL列表响应数据
 */
export interface RoleUrlListResponse {
  list: RoleUrl[]
  total: number
  page: string
  pageSize: string
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}
