import { get } from '../request'
import { RouterRecordListParams, RouterRecordListResponse, RouterRecord } from '../types/router'

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

/**
 * 获取所有路由记录 API（不分页）
 */
export async function getAllRouterRecords(): Promise<RouterRecord[]> {
  const response = await get<RouterRecord[]>('/route/all')
  return response
}
