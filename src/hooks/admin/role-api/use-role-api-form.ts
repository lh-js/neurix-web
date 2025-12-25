import { useState } from 'react'
import { toast } from 'sonner'
import type { RoleApi, CreateRoleApiRequest } from '@/service/types/role-api'
import { getAllRouterRecords } from '@/service/api/router'
import { getAllRoleApis } from '@/service/api/role-api'
import type { GroupedRouterRecord } from '@/service/types/router'

interface UseRoleApiFormProps {
  fetchRoleApiById: (id: number) => Promise<RoleApi>
  handleCreate: (data: CreateRoleApiRequest) => Promise<void>
  handleUpdate: (id: number, data: CreateRoleApiRequest) => Promise<void>
}

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']

export function useRoleApiForm({
  fetchRoleApiById,
  handleCreate,
  handleUpdate,
}: UseRoleApiFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<RoleApi | null>(null)
  const [formData, setFormData] = useState<CreateRoleApiRequest>({
    url: '',
    description: '',
    methods: [],
    isPublic: false,
  })
  const [dialogLoading, setDialogLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [availableRoutes, setAvailableRoutes] = useState<GroupedRouterRecord[]>([])
  const [routesLoading, setRoutesLoading] = useState(false)

  // 获取可用的路由列表（过滤掉已存在的接口）
  const fetchAvailableRoutes = async (excludeApiId?: number) => {
    try {
      setRoutesLoading(true)
      const [routes, existingApis] = await Promise.all([getAllRouterRecords(), getAllRoleApis()])

      // 过滤掉已存在的接口（根据 path 和 method 组合判断）
      // 如果传入了 excludeApiId，则不过滤该接口（用于编辑时显示当前接口支持的方法）
      const existingKeys = new Set(
        existingApis
          .filter(api => !excludeApiId || api.id !== excludeApiId) // 编辑时不过滤当前编辑的接口
          .flatMap(api => api.methods.map(method => `${api.url}::${method}`))
      )

      // 过滤并转换路由数据
      const grouped = routes
        .filter(route => {
          // 检查该路由的所有 methods 是否都已存在
          const routeMethods = route.methods || []
          // 如果该路由的所有 methods 都已存在，则过滤掉
          const allMethodsExist = routeMethods.every(method =>
            existingKeys.has(`${route.url}::${method}`)
          )
          return !allMethodsExist // 只要有一个 method 不存在，就保留该路由
        })
        .map(route => ({
          path: route.url, // 使用 url 字段
          methods: route.methods || [],
          ids: [route.id], // 现在每个路由只有一个 id
        }))
        .sort((a, b) => a.path.localeCompare(b.path))

      setAvailableRoutes(grouped)
    } catch (err) {
      console.error('获取路由列表失败:', err)
      toast.error('获取路由列表失败')
      setAvailableRoutes([])
    } finally {
      setRoutesLoading(false)
    }
  }

  const openCreateDialog = async () => {
    setEditingItem(null)
    setFormData({
      url: '',
      description: '',
      methods: [],
      isPublic: false,
    })
    setIsDialogOpen(true)
    // 打开对话框时获取可用路由
    await fetchAvailableRoutes()
  }

  const openEditDialog = async (item: RoleApi) => {
    setEditingItem(item)
    setDialogLoading(true)
    setIsDialogOpen(true)

    try {
      // 同时获取详情和路由列表（传入当前编辑的 ID，不过滤该接口）
      const [roleApi] = await Promise.all([
        fetchRoleApiById(item.id),
        fetchAvailableRoutes(item.id), // 编辑时传入当前 ID，不过滤该接口
      ])

      setFormData({
        url: roleApi.url,
        description: roleApi.description,
        methods: roleApi.methods || [],
        isPublic: roleApi.isPublic,
      })
      setEditingItem(roleApi)
    } catch {
      // 如果获取失败，使用列表中的数据
      setFormData({
        url: item.url,
        description: item.description,
        methods: item.methods || [],
        isPublic: item.isPublic,
      })
      // 即使获取详情失败，也尝试获取路由列表
      try {
        await fetchAvailableRoutes(item.id)
      } catch {
        // 忽略路由列表获取失败
      }
      toast.error('获取详情失败，使用列表数据')
    } finally {
      setDialogLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (submitting) return

    // 验证至少选择一个 HTTP 方法
    if (formData.methods.length === 0) {
      toast.error('请至少选择一个 HTTP 方法')
      return
    }

    try {
      setSubmitting(true)
      if (editingItem) {
        await handleUpdate(editingItem.id, formData)
        toast.success('更新成功')
      } else {
        await handleCreate(formData)
        toast.success('创建成功')
      }
      setIsDialogOpen(false)
    } catch {
      // 错误已在 hook 中处理
    } finally {
      setSubmitting(false)
    }
  }

  const toggleMethod = (method: string) => {
    setFormData(prev => {
      const methods = prev.methods.includes(method)
        ? prev.methods.filter(m => m !== method)
        : [...prev.methods, method]
      return { ...prev, methods: methods }
    })
  }

  const toggleAllMethods = () => {
    setFormData(prev => {
      const allSelected = HTTP_METHODS.every(method => prev.methods.includes(method))
      return {
        ...prev,
        methods: allSelected ? [] : [...HTTP_METHODS],
      }
    })
  }

  // 选择路由时，自动填充 URL 和所有可用的 methods
  const handleRouteSelect = (groupedRoute: GroupedRouterRecord) => {
    setFormData(prev => {
      // 如果 URL 改变了，自动填充所有可用的 methods
      // 如果 URL 没变，保持当前的 methods 选择
      if (prev.url !== groupedRoute.path) {
        return {
          ...prev,
          url: groupedRoute.path,
          methods: [...groupedRoute.methods], // 自动选中该 URL 的所有可用 methods
        }
      }
      // URL 相同，只更新 URL（虽然不会改变），保持 methods 不变
      return {
        ...prev,
        url: groupedRoute.path,
      }
    })
  }

  return {
    isDialogOpen,
    setIsDialogOpen,
    editingItem,
    formData,
    setFormData,
    dialogLoading,
    submitting,
    openCreateDialog,
    openEditDialog,
    handleSubmit,
    toggleMethod,
    toggleAllMethods,
    HTTP_METHODS,
    availableRoutes,
    routesLoading,
    handleRouteSelect,
  }
}
