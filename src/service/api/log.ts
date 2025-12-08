import { get } from '../request'
import { LogListParams, LogListResponse } from '../types/log'

/**
 * 获取日志列表 API
 */
export async function getLogList(params: LogListParams): Promise<LogListResponse> {
  const response = await get<LogListResponse>('/log', {
    page: params.page.toString(),
    pageSize: params.pageSize.toString(),
  })
  return response
}
