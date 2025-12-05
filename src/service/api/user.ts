import { get, post, patch, del } from '../request'
import {
  User,
  UserListParams,
  UserListResponse,
  CreateUserRequest,
  UpdateUserRequest,
  AdminChangePasswordRequest,
  AdminChangePasswordResponse,
} from '../types/user'

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

/**
 * 获取单个用户
 */
export async function getUserById(id: number): Promise<User> {
  const response = await get<User>(`/user/${id}`)
  return response
}

/**
 * 创建用户
 */
export async function createUser(data: CreateUserRequest): Promise<User> {
  const response = await post<User>('/user', data)
  return response
}

/**
 * 更新用户
 */
export async function updateUser(id: number, data: UpdateUserRequest): Promise<User> {
  const response = await patch<User>(`/user/${id}`, data)
  return response
}

/**
 * 删除用户
 */
export async function deleteUser(id: number): Promise<void> {
  await del(`/user/${id}`)
}

/**
 * 管理员修改用户密码
 */
export async function adminChangePassword(
  data: AdminChangePasswordRequest
): Promise<AdminChangePasswordResponse> {
  const response = await post<AdminChangePasswordResponse>('/user/change-password-admin', data)
  return response
}
