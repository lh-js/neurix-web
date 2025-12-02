import { get, post, patch, del } from '../request'
import {
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleListParams,
  RoleListResponse,
} from '../types/role'

/**
 * 获取角色列表
 */
export async function getRoleList(params: RoleListParams): Promise<RoleListResponse> {
  const response = await get<RoleListResponse>('/role', {
    page: params.page.toString(),
    pageSize: params.pageSize.toString(),
  })
  return response
}

/**
 * 获取单个角色
 */
export async function getRoleById(id: number): Promise<Role> {
  const response = await get<Role>(`/role/${id}`)
  return response
}

/**
 * 创建角色
 */
export async function createRole(data: CreateRoleRequest): Promise<Role> {
  const response = await post<Role>('/role', data)
  return response
}

/**
 * 更新角色
 */
export async function updateRole(id: number, data: UpdateRoleRequest): Promise<Role> {
  const response = await patch<Role>(`/role/${id}`, data)
  return response
}

/**
 * 删除角色
 */
export async function deleteRole(id: number): Promise<void> {
  await del(`/role/${id}`)
}

/**
 * 获取所有角色（不分页，用于选择）
 */
export async function getAllRoles(): Promise<Role[]> {
  const response = await get<Role[]>('/role/all')
  return response
}
