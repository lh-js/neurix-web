/**
 * 接口权限
 */
export interface RoleApi {
  id: number
  url: string
  description: string
  methods: string[] // HTTP 方法数组，如 ['GET', 'POST']
  isPublic: boolean
  createTime?: string
}

/**
 * 创建接口权限请求参数
 */
export interface CreateRoleApiRequest {
  url: string
  description: string
  methods: string[] // HTTP 方法数组，如 ['GET', 'POST']
  isPublic: boolean
}

/**
 * 更新接口权限请求参数
 */
export interface UpdateRoleApiRequest {
  url?: string
  description?: string
  methods?: string[] // HTTP 方法数组，如 ['GET', 'POST']
  isPublic?: boolean
}

/**
 * 接口权限列表查询参数
 */
export interface RoleApiListParams {
  page: number
  pageSize: number
  isPublic?: boolean
}

/**
 * 接口权限列表响应数据
 */
export interface RoleApiListResponse {
  list: RoleApi[]
  total: number
  page: string
  pageSize: string
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}
