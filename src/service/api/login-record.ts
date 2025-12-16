import { get } from '../request'
import { LoginRecordListParams, LoginRecordListResponse } from '../types/login-record'

/**
 * 获取登录记录列表 API
 */
export async function getLoginRecordList(
  params: LoginRecordListParams
): Promise<LoginRecordListResponse> {
  const response = await get<LoginRecordListResponse>('/login-record', {
    page: params.page.toString(),
    pageSize: params.pageSize.toString(),
  })
  return response
}
