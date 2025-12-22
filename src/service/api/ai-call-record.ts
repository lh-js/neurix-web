import { get } from '../request'
import { AiCallRecordListParams, AiCallRecordListResponse } from '../types/ai-call-record'

/**
 * 获取AI调用记录列表 API
 */
export async function getAiCallRecordList(
  params: AiCallRecordListParams
): Promise<AiCallRecordListResponse> {
  const queryParams: Record<string, string> = {
    page: params.page.toString(),
    pageSize: params.pageSize.toString(),
  }

  if (params.userId !== undefined) {
    queryParams.userId = params.userId.toString()
  }

  if (params.status !== undefined) {
    queryParams.status = params.status.toString()
  }

  const response = await get<AiCallRecordListResponse>('/ai-call-record', queryParams)
  return response
}
