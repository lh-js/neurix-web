import { get, post, patch, del } from '../request'
import {
  RolePage,
  CreateRolePageRequest,
  UpdateRolePageRequest,
  RolePageListParams,
  RolePageListResponse,
} from '../types/role-page'

/**
 * 获取页面权限列表
 */
export async function getRolePageList(params: RolePageListParams): Promise<RolePageListResponse> {
  const query: Record<string, string> = {
    page: params.page.toString(),
    pageSize: params.pageSize.toString(),
  }

  if (typeof params.isPublic === 'boolean') {
    query.isPublic = params.isPublic.toString()
  }

  const response = await get<RolePageListResponse>('/role-page', query)
  return response
}

/**
 * 获取单个页面权限
 */
export async function getRolePageById(id: number): Promise<RolePage> {
  const response = await get<RolePage>(`/role-page/${id}`)
  return response
}

/**
 * 创建页面权限
 */
export async function createRolePage(data: CreateRolePageRequest): Promise<RolePage> {
  const response = await post<RolePage>('/role-page', data)
  return response
}

/**
 * 更新页面权限
 */
export async function updateRolePage(id: number, data: UpdateRolePageRequest): Promise<RolePage> {
  const response = await patch<RolePage>(`/role-page/${id}`, data)
  return response
}

/**
 * 删除页面权限
 */
export async function deleteRolePage(id: number): Promise<void> {
  await del(`/role-page/${id}`)
}

/**
 * 获取所有页面权限（不分页，用于选择）
 */
export async function getAllRolePages(): Promise<RolePage[]> {
  const response = await get<RolePage[]>('/role-page/all')
  return response
}

