import { useState } from 'react'
import { toast } from 'sonner'
import type {
  RoleElement,
  CreateRoleElementRequest,
  UpdateRoleElementRequest,
} from '@/service/types/role-element'

interface UseRoleElementFormProps {
  fetchRoleElementById: (id: number) => Promise<RoleElement>
  handleCreate: (data: CreateRoleElementRequest) => Promise<void>
  handleUpdate: (id: number, data: UpdateRoleElementRequest) => Promise<void>
}

export function useRoleElementForm({
  fetchRoleElementById,
  handleCreate,
  handleUpdate,
}: UseRoleElementFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<RoleElement | null>(null)
  const [formData, setFormData] = useState<CreateRoleElementRequest>({
    name: '',
    key: '',
    description: '',
  })
  const [dialogLoading, setDialogLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const openCreateDialog = () => {
    setEditingItem(null)
    setFormData({
      name: '',
      key: '',
      description: '',
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = async (item: RoleElement) => {
    setEditingItem(item)
    setDialogLoading(true)
    setIsDialogOpen(true)

    try {
      const roleElement = await fetchRoleElementById(item.id)
      setFormData({
        name: roleElement.name,
        key: roleElement.key,
        description: roleElement.description || '',
      })
      setEditingItem(roleElement)
    } catch {
      setFormData({
        name: item.name,
        key: item.key,
        description: item.description || '',
      })
      toast.error('获取详情失败，使用列表数据')
    } finally {
      setDialogLoading(false)
    }
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('请输入元素名称')
      return false
    }
    if (!formData.key.trim()) {
      toast.error('请输入元素标识')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (submitting) return
    if (!validateForm()) return

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
