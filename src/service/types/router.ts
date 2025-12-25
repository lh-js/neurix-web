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
