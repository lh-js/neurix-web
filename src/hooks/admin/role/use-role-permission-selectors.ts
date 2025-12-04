import { useCallback } from 'react'
import type { CreateRoleRequest } from '@/service/types/role'
import type { RolePage } from '@/service/types/role-page'
import type { RoleApi } from '@/service/types/role-api'
import type { AccessibleApi } from '@/service/types/role'

type CrudOperation = 'create' | 'read' | 'update' | 'delete'

interface UseRolePermissionSelectorsProps {
  setFormData: React.Dispatch<React.SetStateAction<CreateRoleRequest>>
  editingItem: { id: number } | null
  rolePages: RolePage[]
  roleApis: RoleApi[]
  publicPages: string[]
  publicApis: AccessibleApi[]
}

/**
 * 管理角色权限选择逻辑（页面权限和接口权限的选择、切换）
 */
export function useRolePermissionSelectors({
  setFormData,
  editingItem,
  rolePages,
  roleApis,
  publicPages,
  publicApis,
}: UseRolePermissionSelectorsProps) {
  // 切换页面权限
  const togglePageUrl = useCallback(
    (url: string) => {
      // 新增时，公共页面不允许取消选择
      if (!editingItem && publicPages.includes(url)) {
        return
      }
      setFormData(prev => {
        const pages = prev.accessiblePages.includes(url)
          ? prev.accessiblePages.filter(u => u !== url)
          : [...prev.accessiblePages, url]
        return { ...prev, accessiblePages: pages }
      })
    },
    [editingItem, publicPages, setFormData]
  )

  // 切换接口权限（添加或移除整个接口）
  const toggleApiUrl = useCallback(
    (url: string) => {
      // 在新增模式下，公共接口不允许取消选择
      if (!editingItem && publicApis.some(api => api.url === url)) {
        return
      }
      setFormData(prev => {
        const existingIndex = prev.accessibleApis.findIndex(api => api.url === url)
        if (existingIndex >= 0) {
          // 如果已存在，移除
          return {
            ...prev,
            accessibleApis: prev.accessibleApis.filter(api => api.url !== url),
          }
        } else {
          // 如果不存在，添加（使用接口定义中的默认 method）
          const apiDef = roleApis.find(api => api.url === url)
          return {
            ...prev,
            accessibleApis: [
              ...prev.accessibleApis,
              {
                url,
                methods: apiDef?.methods || [],
              },
            ],
          }
        }
      })
    },
    [editingItem, publicApis, roleApis, setFormData]
  )

  // 切换接口的某个 method
  const toggleApiMethod = useCallback(
    (url: string, method: string) => {
      // 在新增模式下，公共接口的 method 不允许取消选择
      if (!editingItem) {
        const publicApi = publicApis.find(api => api.url === url)
        if (publicApi && publicApi.methods.includes(method)) {
          return
        }
      }
      setFormData(prev => {
        const existingIndex = prev.accessibleApis.findIndex(api => api.url === url)
        if (existingIndex >= 0) {
          // 如果接口已存在，更新 method
          const api = prev.accessibleApis[existingIndex]
          const newMethods = api.methods.includes(method)
            ? api.methods.filter(m => m !== method)
            : [...api.methods, method]

          // 如果所有 method 都被移除了，移除整个接口
          if (newMethods.length === 0) {
            return {
              ...prev,
              accessibleApis: prev.accessibleApis.filter(api => api.url !== url),
            }
          }

          // 更新 method
          const newApis = [...prev.accessibleApis]
          newApis[existingIndex] = { ...api, methods: newMethods }
          return { ...prev, accessibleApis: newApis }
        } else {
          // 如果接口不存在，添加接口和 method
          return {
            ...prev,
            accessibleApis: [
              ...prev.accessibleApis,
              {
                url,
                methods: [method],
              },
            ],
          }
        }
      })
    },
    [editingItem, publicApis, setFormData]
  )

  // 全选/取消全选页面权限
  const toggleAllPages = useCallback(
    (checked: boolean | 'indeterminate') => {
      if (checked === 'indeterminate') return

      setFormData(prev => {
        const allPageUrls = rolePages.map(page => page.url)
        if (!editingItem) {
          // 新增时：全选时包含公共页面，取消全选时只取消非公共页面
          const nonPublicPages = allPageUrls.filter(url => !publicPages.includes(url))
          return {
            ...prev,
            accessiblePages: checked
              ? [...publicPages, ...nonPublicPages] // 全选：公共页面 + 所有非公共页面
              : [...publicPages], // 取消全选：只保留公共页面
          }
        } else {
          // 编辑时：正常全选/取消全选
          return {
            ...prev,
            accessiblePages: checked ? allPageUrls : [],
          }
        }
      })
    },
    [editingItem, rolePages, publicPages, setFormData]
  )

  // 全选/取消全选接口权限
  const toggleAllApis = useCallback(
    (checked: boolean | 'indeterminate') => {
      if (checked === 'indeterminate') return

      setFormData(prev => {
        if (!editingItem) {
          // 新增模式：全选时包含公共接口，取消全选时只取消非公共接口
          const nonPublicApis = roleApis
            .filter(api => !api.isPublic)
            .map(api => ({
              url: api.url,
              methods: api.methods || [],
            }))
          return {
            ...prev,
            accessibleApis: checked
              ? [...publicApis, ...nonPublicApis] // 全选：公共接口 + 所有非公共接口
              : [...publicApis], // 取消全选：只保留公共接口
          }
        } else {
          // 编辑模式：正常全选/取消全选
          if (checked) {
            // 全选：添加所有接口，使用接口定义中的 method
            return {
              ...prev,
              accessibleApis: roleApis.map(api => ({
                url: api.url,
                methods: api.methods || [],
              })),
            }
          } else {
            // 取消全选：移除所有接口
            return {
              ...prev,
              accessibleApis: [],
            }
          }
        }
      })
    },
    [editingItem, roleApis, publicApis, setFormData]
  )

  // 批量快捷选择：增删改查（针对所有接口）
  const toggleAllCrudOperation = useCallback(
    (operation: CrudOperation) => {
      // 定义操作对应的 method
      const operationMethods: Record<string, string[]> = {
        create: ['POST'],
        read: ['GET'],
        update: ['PUT', 'PATCH'],
        delete: ['DELETE'],
      }

      const targetMethods = operationMethods[operation]

      setFormData(prev => {
        // 检查所有接口是否都已选中该操作的所有 method
        const allSelected = roleApis.every(api => {
          const supportedMethods = targetMethods.filter(method => api.methods?.includes(method))
          if (supportedMethods.length === 0) return true // 不支持该操作的接口，视为已选中

          const selectedApi = prev.accessibleApis.find(a => a.url === api.url)
          if (!selectedApi) return false
          const selectedMethods = selectedApi.methods || []
          return supportedMethods.every(method => selectedMethods.includes(method))
        })

        if (allSelected) {
          // 取消选择：从所有接口中移除该操作的方法
          return {
            ...prev,
            accessibleApis: prev.accessibleApis
              .map(api => {
                const apiDef = roleApis.find(a => a.url === api.url)
                if (!apiDef) return api

                const supportedMethods = targetMethods.filter(method =>
                  apiDef.methods?.includes(method)
                )
                if (supportedMethods.length === 0) return api

                // 移除目标方法，但保留公共接口的 method（新增模式）
                const currentMethods = api.methods || []
                const newMethods = currentMethods.filter(m => {
                  if (!editingItem) {
                    const publicApi = publicApis.find(pa => pa.url === api.url)
                    const publicMethods = publicApi?.methods || []
                    if (publicMethods.includes(m)) {
                      return true
                    }
                  }
                  return !supportedMethods.includes(m)
                })

                if (newMethods.length === 0) {
                  return null // 标记为删除
                }
                return { ...api, methods: newMethods }
              })
              .filter(
                (api): api is typeof api & { url: string; methods: string[] } => api !== null
              ),
          }
        } else {
          // 选择：为所有接口添加该操作的方法
          const updatedApis = [...prev.accessibleApis]

          roleApis.forEach(apiDef => {
            const supportedMethods = targetMethods.filter(method =>
              apiDef.methods?.includes(method)
            )
            if (supportedMethods.length === 0) return

            const existingIndex = updatedApis.findIndex(a => a.url === apiDef.url)
            if (existingIndex >= 0) {
              // 更新现有接口
              const currentMethods = updatedApis[existingIndex].methods || []
              const newMethods = [...new Set([...currentMethods, ...supportedMethods])]
              updatedApis[existingIndex] = { ...updatedApis[existingIndex], methods: newMethods }
            } else {
              // 添加新接口
              updatedApis.push({
                url: apiDef.url,
                methods: supportedMethods,
              })
            }
          })

          return { ...prev, accessibleApis: updatedApis }
        }
      })
    },
    [editingItem, roleApis, publicApis, setFormData]
  )

  return {
    togglePageUrl,
    toggleApiUrl,
    toggleApiMethod,
    toggleAllPages,
    toggleAllApis,
    toggleAllCrudOperation,
  }
}
