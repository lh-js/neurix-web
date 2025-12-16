/**
 * 登录记录信息
 */
export interface LoginRecord {
  id: number
  userId: number
  email: string
  ipAddress: string
  city: string
  province: string
  country: string
  loginType: 'password' | 'code'
  status: number // 1: 成功, 其他: 失败
  failureReason: string | null
  userAgent: string
  loginTime: string
  createTime: string
}

/**
 * 登录记录列表查询参数
 */
export interface LoginRecordListParams {
  page: number
  pageSize: number
}

/**
 * 登录记录列表响应数据
 */
export interface LoginRecordListResponse {
  list: LoginRecord[]
  total: number
  page: string
  pageSize: string
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}
