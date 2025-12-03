import { useState, useCallback } from 'react'
import { toast } from 'sonner'

interface UseDeleteDialogProps<T> {
  onDelete: (id: T) => Promise<void>
  successMessage?: string
}

/**
 * 通用的删除对话框管理 hook
 * 管理删除对话框的打开/关闭状态、删除 ID、删除中状态等
 */
export function useDeleteDialog<T extends number | string>({
  onDelete,
  successMessage = '删除成功',
}: UseDeleteDialogProps<T>) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<T | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDeleteClick = useCallback((id: T) => {
    setDeletingId(id)
    setIsDeleteDialogOpen(true)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (deletingId === null || deleting) return

    try {
      setDeleting(true)
      await onDelete(deletingId)
      toast.success(successMessage)
      setDeletingId(null)
      setIsDeleteDialogOpen(false)
    } catch {
      // 错误已在 onDelete 中处理
      // 删除失败时保持对话框打开，让用户可以看到错误信息
    } finally {
      setDeleting(false)
    }
  }, [deletingId, deleting, onDelete, successMessage])

  const handleCancel = useCallback(() => {
    setDeletingId(null)
  }, [])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      // 删除过程中不允许关闭对话框
      if (!open && deleting) {
        return
      }
      setIsDeleteDialogOpen(open)
    },
    [deleting]
  )

  return {
    isDeleteDialogOpen,
    deletingId,
    deleting,
    handleDeleteClick,
    confirmDelete,
    handleCancel,
    handleOpenChange,
  }
}
