import { useState } from 'react'
import { toast } from 'sonner'
import type { RoleApi, CreateRoleApiRequest } from '@/service/types/role-api'

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
    method: [],
    isPublic: false,
  })
  const [dialogLoading, setDialogLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const openCreateDialog = () => {
    setEditingItem(null)
    setFormData({
      url: '',
      description: '',
      method: [],
      isPublic: false,
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = async (item: RoleApi) => {
    setEditingItem(item)
    setDialogLoading(true)
    setIsDialogOpen(true)

    try {
      // 通过接口获取最新的数据
      const roleApi = await fetchRoleApiById(item.id)
      setFormData({
        url: roleApi.url,
        description: roleApi.description,
        method: roleApi.method || [],
        isPublic: roleApi.isPublic,
      })
      setEditingItem(roleApi)
    } catch {
      // 如果获取失败，使用列表中的数据
      setFormData({
        url: item.url,
        description: item.description,
        method: item.method || [],
        isPublic: item.isPublic,
      })
      toast.error('获取详情失败，使用列表数据')
    } finally {
      setDialogLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (submitting) return

    // 验证至少选择一个 HTTP 方法
    if (formData.method.length === 0) {
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
      const methods = prev.method.includes(method)
        ? prev.method.filter(m => m !== method)
        : [...prev.method, method]
      return { ...prev, method: methods }
    })
  }

  const toggleAllMethods = () => {
    setFormData(prev => {
      const allSelected = HTTP_METHODS.every(method => prev.method.includes(method))
      return {
        ...prev,
        method: allSelected ? [] : [...HTTP_METHODS],
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
  }
}

