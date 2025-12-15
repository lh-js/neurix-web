import { get } from '../request'
import { EmailCodeListParams, EmailCodeListResponse } from '../types/email-code'

/**
 * 获取邮箱验证码列表 API
 */
export async function getEmailCodeList(
  params: EmailCodeListParams
): Promise<EmailCodeListResponse> {
  const response = await get<EmailCodeListResponse>('/email-code', {
    page: params.page.toString(),
    pageSize: params.pageSize.toString(),
  })
  return response
}
