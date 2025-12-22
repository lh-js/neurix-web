/**
 * AI调用记录
 */
export interface AiCallRecord {
  id: number
  userId: number
  email: string
  model: string
  requestMessages: Array<{
    role: string
    content: string
  }>
  responseContent: string
  isStream: boolean
  promptTokens: number
  completionTokens: number
  totalTokens: number
  ipAddress: string
  city: string
  province: string
  country: string
  userAgent: string
  status: number // 1: 成功, 其他: 失败
  failureReason: string | null
  callTime: string
  createTime: string
}

/**
 * AI调用记录列表查询参数
 */
export interface AiCallRecordListParams {
  page: number
  pageSize: number
  userId?: number
  status?: number // 1: 成功, 其他: 失败
}

/**
 * AI调用记录列表响应数据
 */
export interface AiCallRecordListResponse {
  list: AiCallRecord[]
  total: number
  page: string
  pageSize: string
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}
