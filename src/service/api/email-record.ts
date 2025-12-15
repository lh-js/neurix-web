import { get } from '../request'
import { EmailRecordListParams, EmailRecordListResponse } from '../types/email-record'

/**
 * 获取邮件记录列表 API
 */
export async function getEmailRecordList(
  params: EmailRecordListParams
): Promise<EmailRecordListResponse> {
  const response = await get<EmailRecordListResponse>('/email-record', {
    page: params.page.toString(),
    pageSize: params.pageSize.toString(),
  })
  return response
}
