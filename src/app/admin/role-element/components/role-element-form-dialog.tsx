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
import type { CreateRoleElementRequest } from '@/service/types/role-element'

interface RoleElementFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing?: boolean
  formData: CreateRoleElementRequest
  onFormDataChange: (data: CreateRoleElementRequest) => void
  onSubmit: () => void
  loading?: boolean
  submitting?: boolean
}

export function RoleElementFormDialog({
  open,
  onOpenChange,
  editing = false,
  formData,
  onFormDataChange,
  onSubmit,
  loading = false,
  submitting = false,
}: RoleElementFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? '编辑元素权限' : '新增元素权限'}</DialogTitle>
          <DialogDescription>
            {editing ? '修改元素权限信息' : '创建一个新的元素权限'}
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">元素名称</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => onFormDataChange({ ...formData, name: e.target.value })}
                placeholder="请输入元素名称（例如：创建按钮）"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="key">元素标识</Label>
              <Input
                id="key"
                value={formData.key}
                onChange={e => {
                  const sanitizedValue = e.target.value.replace(/\./g, '-')
                  onFormDataChange({ ...formData, key: sanitizedValue })
                }}
                placeholder="请输入唯一标识（例如：user-create-button）"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={e => onFormDataChange({ ...formData, description: e.target.value })}
                placeholder="请输入描述信息"
                disabled={loading}
              />
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
