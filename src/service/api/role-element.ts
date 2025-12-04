import { get, post, patch, del } from '../request'
import {
  RoleElement,
  CreateRoleElementRequest,
  UpdateRoleElementRequest,
  RoleElementListParams,
  RoleElementListResponse,
} from '../types/role-element'

/**
 * 获取元素权限列表
 */
export async function getRoleElementList(
  params: RoleElementListParams
): Promise<RoleElementListResponse> {
  const query: Record<string, string> = {
    page: params.page.toString(),
    pageSize: params.pageSize.toString(),
  }

  const response = await get<RoleElementListResponse>('/role-element', query)
  return response
}

/**
 * 获取单个元素权限
 */
export async function getRoleElementById(id: number): Promise<RoleElement> {
  const response = await get<RoleElement>(`/role-element/${id}`)
  return response
}

/**
 * 创建元素权限
 */
export async function createRoleElement(data: CreateRoleElementRequest): Promise<RoleElement> {
  const response = await post<RoleElement>('/role-element', data)
  return response
}

/**
 * 更新元素权限
 */
export async function updateRoleElement(
  id: number,
  data: UpdateRoleElementRequest
): Promise<RoleElement> {
  const response = await patch<RoleElement>(`/role-element/${id}`, data)
  return response
}

/**
 * 删除元素权限
 */
export async function deleteRoleElement(id: number): Promise<void> {
  await del(`/role-element/${id}`)
}

/**
 * 获取所有元素权限（不分页）
 */
export async function getAllRoleElements(): Promise<RoleElement[]> {
  const response = await get<RoleElement[]>('/role-element/all')
  return response
}
