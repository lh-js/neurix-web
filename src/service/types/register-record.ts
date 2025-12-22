/**
 * 注册记录信息
 */
export interface RegisterRecord {
  id: number
  userId: number | null
  email: string
  ipAddress: string
  city: string
  province: string
  country: string
  status: number // 1: 成功, 其他: 失败
  failureReason: string | null
  userAgent: string
  registerTime: string
  createTime: string
}

/**
 * 注册记录列表查询参数
 */
export interface RegisterRecordListParams {
  page: number
  pageSize: number
}

/**
 * 注册记录列表响应数据
 */
export interface RegisterRecordListResponse {
  list: RegisterRecord[]
  total: number
  page: string
  pageSize: string
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}
