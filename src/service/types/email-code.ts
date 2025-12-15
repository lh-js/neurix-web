/**
 * 邮箱验证码信息
 */
export interface EmailCode {
  id: number
  code: string
  to: string
  isUsed: boolean
  codeSendTime: string
  codeExpiredTime: string
  codeUsedTime: string | null
  createTime: string
}

/**
 * 邮箱验证码列表查询参数
 */
export interface EmailCodeListParams {
  page: number
  pageSize: number
}

/**
 * 邮箱验证码列表响应数据
 */
export interface EmailCodeListResponse {
  list: EmailCode[]
  total: number
  page: string
  pageSize: string
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}
