'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import type { CreateRoleApiRequest } from '@/service/types/role-api'

interface RoleApiFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing?: boolean
  formData: CreateRoleApiRequest
  onFormDataChange: (data: CreateRoleApiRequest) => void
  onSubmit: () => void
  loading?: boolean
  submitting?: boolean
  onToggleMethod: (method: string) => void
  onToggleAllMethods: () => void
  httpMethods: string[]
}

export function RoleApiFormDialog({
  open,
  onOpenChange,
  editing = false,
  formData,
  onFormDataChange,
  onSubmit,
  loading = false,
  submitting = false,
  onToggleMethod,
  onToggleAllMethods,
  httpMethods,
}: RoleApiFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? '编辑接口权限' : '新增接口权限'}</DialogTitle>
          <DialogDescription>
            {editing ? '修改接口权限信息' : '创建一个新的接口权限'}
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
              <div className="flex items-center justify-between">
                <Label htmlFor="method">HTTP 方法</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onToggleAllMethods}
                  disabled={loading}
                >
                  {httpMethods.every(method => formData.method.includes(method))
                    ? '取消全选'
                    : '全选'}
                </Button>
              </div>
              <div className="border rounded-md p-4 space-y-2">
                {httpMethods.map(method => (
                  <div key={method} className="flex items-center space-x-2">
                    <Checkbox
                      id={`method-${method}`}
                      checked={formData.method.includes(method)}
                      onCheckedChange={() => onToggleMethod(method)}
                      disabled={loading}
                    />
                    <Label
                      htmlFor={`method-${method}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {method}
                    </Label>
                  </div>
                ))}
              </div>
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
