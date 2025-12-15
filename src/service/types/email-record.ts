/**
 * 邮件记录信息
 */
export interface EmailRecord {
  id: number
  from: string
  to: string
  subject: string
  text: string | null
  html: string | null
  attachments: string | null
  emailSendTime: string
  createTime: string
}

/**
 * 邮件记录列表查询参数
 */
export interface EmailRecordListParams {
  page: number
  pageSize: number
}

/**
 * 邮件记录列表响应数据
 */
export interface EmailRecordListResponse {
  list: EmailRecord[]
  total: number
  page: string
  pageSize: string
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}
