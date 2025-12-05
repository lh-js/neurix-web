'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'

interface ChangePasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userEmail: string
  newPassword: string
  onNewPasswordChange: (password: string) => void
  onSubmit: () => void
  submitting?: boolean
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
  userEmail,
  newPassword,
  onNewPasswordChange,
  onSubmit,
  submitting = false,
}: ChangePasswordDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>修改密码</DialogTitle>
          <DialogDescription>
            为用户 <span className="font-medium text-foreground">{userEmail}</span> 设置新密码
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">新密码</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={e => onNewPasswordChange(e.target.value)}
              placeholder="请输入新密码"
              disabled={submitting}
              minLength={6}
            />
            <p className="text-sm text-muted-foreground">密码长度至少6位</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            取消
          </Button>
          <Button
            onClick={onSubmit}
            disabled={submitting || !newPassword.trim() || newPassword.length < 6}
          >
            {submitting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                修改中...
              </>
            ) : (
              '确认修改'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
