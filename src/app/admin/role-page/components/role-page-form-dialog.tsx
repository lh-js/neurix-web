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
import type { CreateRolePageRequest } from '@/service/types/role-page'

interface RolePageFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing?: boolean
  formData: CreateRolePageRequest
  onFormDataChange: (data: CreateRolePageRequest) => void
  onSubmit: () => void
  loading?: boolean
  submitting?: boolean
}

export function RolePageFormDialog({
  open,
  onOpenChange,
  editing = false,
  formData,
  onFormDataChange,
  onSubmit,
  loading = false,
  submitting = false,
}: RolePageFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? '编辑页面权限' : '新增页面权限'}</DialogTitle>
          <DialogDescription>
            {editing ? '修改页面权限信息' : '创建一个新的页面权限'}
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
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={e => onFormDataChange({ ...formData, url: e.target.value })}
                placeholder="请输入URL"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={e => onFormDataChange({ ...formData, description: e.target.value })}
                placeholder="请输入描述"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="isPublic">是否公开</Label>
              <Select
                value={formData.isPublic.toString()}
                onValueChange={value =>
                  onFormDataChange({ ...formData, isPublic: value === 'true' })
                }
                disabled={loading}
              >
                <SelectTrigger id="isPublic">
                  <SelectValue placeholder="请选择是否公开" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">是</SelectItem>
                  <SelectItem value="false">否</SelectItem>
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
