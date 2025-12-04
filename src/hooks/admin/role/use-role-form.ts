import { useState } from 'react'
import { toast } from 'sonner'
import type { Role, CreateRoleRequest } from '@/service/types/role'
import type { RoleApi } from '@/service/types/role-api'
import type { AccessibleApi } from '@/service/types/role'

interface UseRoleFormProps {
  fetchRoleById: (id: number) => Promise<Role>
  handleCreate: (data: CreateRoleRequest) => Promise<void>
  handleUpdate: (id: number, data: CreateRoleRequest) => Promise<void>
  publicPages: string[]
  publicApis: AccessibleApi[]
  roleApis: RoleApi[]
}

/**
 * 管理角色表单状态和对话框逻辑
 */
export function useRoleForm({
  fetchRoleById,
  handleCreate,
  handleUpdate,
  publicPages,
  publicApis,
  roleApis,
}: UseRoleFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Role | null>(null)
  const [formData, setFormData] = useState<CreateRoleRequest>({
    name: '',
    description: '',
    level: 0,
    accessiblePages: [],
    accessibleApis: [],
  })
  const [dialogLoading, setDialogLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const convertAccessibleApis = (
    apis: Role['accessibleApis']
  ): CreateRoleRequest['accessibleApis'] => {
    if (!apis || apis.length === 0) return []
    return apis.map(api => ({
      url: api.url,
      methods: api.methods || [],
    }))
  }

  const openCreateDialog = () => {
    setEditingItem(null)
    // 新增时，公共页面和公共接口默认选中
    setFormData({
      name: '',
      description: '',
      level: 0,
      accessiblePages: [...publicPages],
      accessibleApis: publicApis.map(api => ({
        url: api.url,
        methods: api.methods || [],
      })), // 默认选中所有公共接口（包含所有 method）
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = async (item: Role) => {
    setEditingItem(item)
    setDialogLoading(true)
    setIsDialogOpen(true)

    try {
      // 通过接口获取最新的数据
      const role = await fetchRoleById(item.id)
      setFormData({
        name: role.name,
        description: role.description,
        level: role.level,
        accessiblePages: role.accessiblePages || [],
        accessibleApis: convertAccessibleApis(role.accessibleApis),
      })
      setEditingItem(role)
    } catch {
      // 如果获取失败，使用列表中的数据
      setFormData({
        name: item.name,
        description: item.description,
        level: item.level,
        accessiblePages: item.accessiblePages || [],
        accessibleApis: convertAccessibleApis(item.accessibleApis),
      })
      toast.error('获取详情失败，使用列表数据')
    } finally {
      setDialogLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (submitting) return

    try {
      setSubmitting(true)
      // 新增时，确保公共页面和公共接口始终在提交的数据中
      const submitData = editingItem
        ? formData
        : {
            ...formData,
            accessiblePages: [...new Set([...publicPages, ...formData.accessiblePages])],
            // 合并公共接口，确保公共接口的所有 method 都在
            accessibleApis: [
              ...publicApis,
              ...formData.accessibleApis.filter(
                api => !publicApis.some(publicApi => publicApi.url === api.url)
              ),
            ],
          }
      if (editingItem) {
        await handleUpdate(editingItem.id, submitData)
        toast.success('更新成功')
      } else {
        await handleCreate(submitData)
        toast.success('创建成功')
      }
      setIsDialogOpen(false)
    } catch {
      // 错误已在 hook 中处理
    } finally {
      setSubmitting(false)
    }
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
  }
}
