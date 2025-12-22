import { get } from '../request'
import { RegisterRecordListParams, RegisterRecordListResponse } from '../types/register-record'

/**
 * 获取注册记录列表 API
 */
export async function getRegisterRecordList(
  params: RegisterRecordListParams
): Promise<RegisterRecordListResponse> {
  const response = await get<RegisterRecordListResponse>('/register-record', {
    page: params.page.toString(),
    pageSize: params.pageSize.toString(),
  })
  return response
}
