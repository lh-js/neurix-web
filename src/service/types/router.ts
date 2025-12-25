/**
 * 路由记录信息
 */
export interface RouterRecord {
  id: number
  path: string
  method: string
}

/**
 * 路由记录列表查询参数
 */
export interface RouterRecordListParams {
  page: number
  pageSize: number
}

/**
 * 路由记录列表响应数据
 */
export interface RouterRecordListResponse {
  list: RouterRecord[]
  total: number
  page: string
  pageSize: string
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

/**
 * 整合后的路由信息（相同 URL 的不同 methods 整合在一起）
 */
export interface GroupedRouterRecord {
  path: string
  methods: string[]
  ids: number[] // 原始记录的 ID 数组
}
