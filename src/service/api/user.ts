import { get } from '../request'
import { UserListParams, UserListResponse } from '../types/user'

/**
 * 获取用户列表 API
 */
export async function getUserList(params: UserListParams): Promise<UserListResponse> {
  const response = await get<UserListResponse>('/user', {
    page: params.page.toString(),
    pageSize: params.pageSize.toString(),
  })
  return response
}

