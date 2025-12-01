import { get, post, patch, del } from '../request'
import {
  RoleUrl,
  CreateRoleUrlRequest,
  UpdateRoleUrlRequest,
  RoleUrlListParams,
  RoleUrlListResponse,
} from '../types/role-url'

/**
 * 获取权限URL列表
 */
export async function getRoleUrlList(params: RoleUrlListParams): Promise<RoleUrlListResponse> {
  const query: Record<string, string> = {
    page: params.page.toString(),
    pageSize: params.pageSize.toString(),
  }

  if (typeof params.type === 'number') {
    query.type = params.type.toString()
  }

  const response = await get<RoleUrlListResponse>('/role-url', query)
  return response
}

/**
 * 获取单个权限URL
 */
export async function getRoleUrlById(id: number): Promise<RoleUrl> {
  const response = await get<RoleUrl>(`/role-url/${id}`)
  return response
}

/**
 * 创建权限URL
 */
export async function createRoleUrl(data: CreateRoleUrlRequest): Promise<RoleUrl> {
  const response = await post<RoleUrl>('/role-url', data)
  return response
}

/**
 * 更新权限URL
 */
export async function updateRoleUrl(id: number, data: UpdateRoleUrlRequest): Promise<RoleUrl> {
  const response = await patch<RoleUrl>(`/role-url/${id}`, data)
  return response
}

/**
 * 删除权限URL
 */
export async function deleteRoleUrl(id: number): Promise<void> {
  await del(`/role-url/${id}`)
}

