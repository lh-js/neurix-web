import { useState } from 'react'
import { toast } from 'sonner'
import type { RolePage, CreateRolePageRequest } from '@/service/types/role-page'

interface UseRolePageFormProps {
  fetchRolePageById: (id: number) => Promise<RolePage>
  handleCreate: (data: CreateRolePageRequest) => Promise<void>
  handleUpdate: (id: number, data: CreateRolePageRequest) => Promise<void>
}

export function useRolePageForm({
  fetchRolePageById,
  handleCreate,
  handleUpdate,
}: UseRolePageFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<RolePage | null>(null)
  const [formData, setFormData] = useState<CreateRolePageRequest>({
    url: '',
    description: '',
    isPublic: false,
  })
  const [dialogLoading, setDialogLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const openCreateDialog = () => {
    setEditingItem(null)
    setFormData({
      url: '',
      description: '',
      isPublic: false,
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = async (item: RolePage) => {
    setEditingItem(item)
    setDialogLoading(true)
    setIsDialogOpen(true)

    try {
      // 通过接口获取最新的数据
      const rolePage = await fetchRolePageById(item.id)
      setFormData({
        url: rolePage.url,
        description: rolePage.description,
        isPublic: rolePage.isPublic,
      })
      setEditingItem(rolePage)
    } catch {
      // 如果获取失败，使用列表中的数据
      setFormData({
        url: item.url,
        description: item.description,
        isPublic: item.isPublic,
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

