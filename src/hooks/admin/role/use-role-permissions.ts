import { useState, useEffect, useRef } from 'react'
import { getAllRolePages } from '@/service/api/role-page'
import { getAllRoleApis } from '@/service/api/role-api'
import { getAllRoleElements } from '@/service/api/role-element'
import type { RolePage } from '@/service/types/role-page'
import type { RoleApi } from '@/service/types/role-api'
import type { RoleElement } from '@/service/types/role-element'
import type { AccessibleApi } from '@/service/types/role'

/**
 * 管理角色权限数据（页面权限和接口权限）
 */
export function useRolePermissions() {
  const [rolePages, setRolePages] = useState<RolePage[]>([])
  const [roleApis, setRoleApis] = useState<RoleApi[]>([])
  const [roleElements, setRoleElements] = useState<RoleElement[]>([])
  const [rolePagesLoading, setRolePagesLoading] = useState(false)
  const [roleApisLoading, setRoleApisLoading] = useState(false)
  const [roleElementsLoading, setRoleElementsLoading] = useState(false)
  const fetchingRolePagesRef = useRef(false)
  const fetchingRoleApisRef = useRef(false)
  const fetchingRoleElementsRef = useRef(false)

  // 获取所有页面权限
  useEffect(() => {
    if (fetchingRolePagesRef.current) {
      return
    }

    fetchingRolePagesRef.current = true

    const fetchRolePages = async () => {
      setRolePagesLoading(true)
      try {
        const pages = await getAllRolePages()
        setRolePages(pages)
      } catch (err) {
        console.error('获取页面权限列表失败:', err)
      } finally {
        setRolePagesLoading(false)
        fetchingRolePagesRef.current = false
      }
    }
    fetchRolePages()
  }, [])

  // 获取所有接口权限
  useEffect(() => {
    if (fetchingRoleApisRef.current) {
      return
    }

    fetchingRoleApisRef.current = true

    const fetchRoleApis = async () => {
      setRoleApisLoading(true)
      try {
        const apis = await getAllRoleApis()
        setRoleApis(apis)
      } catch (err) {
        console.error('获取接口权限列表失败:', err)
      } finally {
        setRoleApisLoading(false)
        fetchingRoleApisRef.current = false
      }
    }
    fetchRoleApis()
  }, [])

  // 获取所有元素权限
  useEffect(() => {
    if (fetchingRoleElementsRef.current) {
      return
    }

    fetchingRoleElementsRef.current = true

    const fetchRoleElements = async () => {
      setRoleElementsLoading(true)
      try {
        const elements = await getAllRoleElements()
        setRoleElements(elements)
      } catch (err) {
        console.error('获取元素权限列表失败:', err)
      } finally {
        setRoleElementsLoading(false)
        fetchingRoleElementsRef.current = false
      }
    }

    fetchRoleElements()
  }, [])

  // 计算公共页面
  const publicPages = rolePages.filter(page => page.isPublic).map(page => page.url)

  // 计算公共接口（包含所有 method）
  const publicApis: AccessibleApi[] = roleApis
    .filter(api => api.isPublic)
    .map(api => ({
      url: api.url,
      methods: api.methods || [],
    }))

  const permissionsLoading = rolePagesLoading || roleApisLoading || roleElementsLoading

  return {
    rolePages,
    roleApis,
    roleElements,
    publicPages,
    publicApis,
    rolePagesLoading,
    roleApisLoading,
    roleElementsLoading,
    permissionsLoading,
  }
}
