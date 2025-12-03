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
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CreateUserRequest } from '@/service/types/user'
import type { Role } from '@/service/types/role'

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing?: boolean
  formData: CreateUserRequest
  onFormDataChange: (data: CreateUserRequest) => void
  onSubmit: () => void
  loading?: boolean
  submitting?: boolean
  roles: Role[]
  rolesLoading?: boolean
}

export function UserFormDialog({
  open,
  onOpenChange,
  editing = false,
  formData,
  onFormDataChange,
  onSubmit,
  loading = false,
  submitting = false,
  roles,
  rolesLoading = false,
}: UserFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? '编辑用户' : '新增用户'}</DialogTitle>
          <DialogDescription>
            {editing ? '修改用户信息' : '创建一个新的用户'}
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={e => onFormDataChange({ ...formData, email: e.target.value })}
                placeholder="请输入邮箱"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nickname">昵称</Label>
              <Input
                id="nickname"
                value={formData.nickname}
                onChange={e => onFormDataChange({ ...formData, nickname: e.target.value })}
                placeholder="请输入昵称"
                disabled={loading}
              />
            </div>
            {!editing && (
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={e => onFormDataChange({ ...formData, password: e.target.value })}
                  placeholder="请输入密码"
                  disabled={loading}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="role">角色</Label>
              <Select
                value={formData.role.toString()}
                onValueChange={value =>
                  onFormDataChange({ ...formData, role: parseInt(value) })
                }
                disabled={loading || rolesLoading}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="请选择角色" />
                </SelectTrigger>
                <SelectContent>
                  {rolesLoading ? (
                    <div className="p-2 text-sm text-muted-foreground">加载中...</div>
                  ) : roles.length > 0 ? (
                    roles.map(role => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground">暂无角色</div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting || loading}
          >
            取消
          </Button>
          <Button onClick={onSubmit} disabled={submitting || loading}>
            {submitting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                处理中...
              </>
            ) : editing ? (
              '更新'
            ) : (
              '创建'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

