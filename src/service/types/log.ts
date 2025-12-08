/**
 * 日志信息
 */
export interface Log {
  id: number
  context: string
  message: string
  level: string
  logCreateTime: string
  createTime: string
}

/**
 * 日志列表查询参数
 */
export interface LogListParams {
  page: number
  pageSize: number
}

/**
 * 日志列表响应数据
 */
export interface LogListResponse {
  list: Log[]
  total: number
  page: string
  pageSize: string
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}
