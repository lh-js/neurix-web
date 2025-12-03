import { get, post, patch, del } from '../request'
import {
  RoleApi,
  CreateRoleApiRequest,
  UpdateRoleApiRequest,
  RoleApiListParams,
  RoleApiListResponse,
} from '../types/role-api'

/**
 * 获取接口权限列表
 */
export async function getRoleApiList(params: RoleApiListParams): Promise<RoleApiListResponse> {
  const query: Record<string, string> = {
    page: params.page.toString(),
    pageSize: params.pageSize.toString(),
  }

  if (typeof params.isPublic === 'boolean') {
    query.isPublic = params.isPublic.toString()
  }

  const response = await get<RoleApiListResponse>('/role-api', query)
  return response
}

/**
 * 获取单个接口权限
 */
export async function getRoleApiById(id: number): Promise<RoleApi> {
  const response = await get<RoleApi>(`/role-api/${id}`)
  return response
}

/**
 * 创建接口权限
 */
export async function createRoleApi(data: CreateRoleApiRequest): Promise<RoleApi> {
  const response = await post<RoleApi>('/role-api', data)
  return response
}

/**
 * 更新接口权限
 */
export async function updateRoleApi(id: number, data: UpdateRoleApiRequest): Promise<RoleApi> {
  const response = await patch<RoleApi>(`/role-api/${id}`, data)
  return response
}

/**
 * 删除接口权限
 */
export async function deleteRoleApi(id: number): Promise<void> {
  await del(`/role-api/${id}`)
}

/**
 * 获取所有接口权限（不分页，用于选择）
 */
export async function getAllRoleApis(): Promise<RoleApi[]> {
  const response = await get<RoleApi[]>('/role-api/all')
  return response
}
