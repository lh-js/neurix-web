import { useState } from 'react'
import { toast } from 'sonner'
import { adminChangePassword } from '@/service/api/user'
import { AdminChangePasswordRequest } from '@/service/types/user'

export function useChangePassword() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [selectedUserEmail, setSelectedUserEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const openChangePasswordDialog = (userId: number, userEmail: string) => {
    setSelectedUserId(userId)
    setSelectedUserEmail(userEmail)
    setNewPassword('')
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setSelectedUserId(null)
    setSelectedUserEmail('')
    setNewPassword('')
  }

  const handleSubmit = async () => {
    if (!selectedUserId || !newPassword.trim()) return

    if (newPassword.length < 6) {
      toast.error('密码长度至少6位')
      return
    }

    try {
      setSubmitting(true)
      const request: AdminChangePasswordRequest = {
        userId: selectedUserId,
        newPassword: newPassword.trim(),
      }

      await adminChangePassword(request)
      toast.success('密码修改成功')
      closeDialog()
    } catch (error) {
      console.error('修改密码失败:', error)
      toast.error('修改密码失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  return {
    isDialogOpen,
    selectedUserId,
    selectedUserEmail,
    newPassword,
    submitting,
    openChangePasswordDialog,
    closeDialog,
    setNewPassword,
    handleSubmit,
  }
}
