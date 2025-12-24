import { get } from '../request'
import { RouterRecordListParams, RouterRecordListResponse } from '../types/router'

/**
 * 获取路由记录列表 API
 */
export async function getRouterRecordList(
  params: RouterRecordListParams
): Promise<RouterRecordListResponse> {
  const response = await get<RouterRecordListResponse>('/route', {
    page: params.page.toString(),
    pageSize: params.pageSize.toString(),
  })
  return response
}

