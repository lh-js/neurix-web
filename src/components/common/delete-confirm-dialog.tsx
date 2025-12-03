'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Spinner } from '@/components/ui/spinner'

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  deleting?: boolean
  onConfirm: () => void
  onCancel?: () => void
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title = '确认删除',
  description = '确定要删除这条记录吗？此操作无法撤销。',
  deleting = false,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  const handleOpenChange = (newOpen: boolean) => {
    // 删除过程中不允许关闭对话框
    if (!newOpen && deleting) {
      return
    }
    onOpenChange(newOpen)
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
  }

  const handleConfirm = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // 阻止 AlertDialogAction 的默认关闭行为
    e.preventDefault()
    // 如果正在删除，直接返回
    if (deleting) {
      return
    }
    await onConfirm()
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={deleting}>
            取消
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                删除中...
              </>
            ) : (
              '删除'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
