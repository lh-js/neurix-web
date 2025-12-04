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
import type { CreateRoleRequest } from '@/service/types/role'
import { PagePermissionSelector } from './page-permission-selector'
import { ApiPermissionSelector } from './api-permission-selector'
import type { RolePage } from '@/service/types/role-page'
import type { RoleApi } from '@/service/types/role-api'
import type { AccessibleApi } from '@/service/types/role'

type CrudOperation = 'create' | 'read' | 'update' | 'delete'

interface RoleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing?: boolean
  formData: CreateRoleRequest
  onFormDataChange: (data: CreateRoleRequest) => void
  onSubmit: () => void
  loading?: boolean
  submitting?: boolean
  // 页面权限相关
  rolePages: RolePage[]
  publicPages: string[]
  pagesLoading?: boolean
  onTogglePage: (url: string) => void
  onToggleAllPages: (checked: boolean | 'indeterminate') => void
  // 接口权限相关
  roleApis: RoleApi[]
  publicApis: AccessibleApi[]
  apisLoading?: boolean
  onToggleApi: (url: string) => void
  onToggleMethod: (url: string, method: string) => void
  onToggleAllApis: (checked: boolean | 'indeterminate') => void
  onCrudOperationChange: (operation: CrudOperation) => void
}

export function RoleFormDialog({
  open,
  onOpenChange,
  editing = false,
  formData,
  onFormDataChange,
  onSubmit,
  loading = false,
  submitting = false,
  rolePages,
  publicPages,
  pagesLoading = false,
  onTogglePage,
  onToggleAllPages,
  roleApis,
  publicApis,
  apisLoading = false,
  onToggleApi,
  onToggleMethod,
  onToggleAllApis,
  onCrudOperationChange,
}: RoleFormDialogProps) {
  const permissionsLoading = pagesLoading || apisLoading

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? '编辑角色' : '新增角色'}</DialogTitle>
          <DialogDescription>{editing ? '修改角色信息' : '创建一个新的角色'}</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">名称</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => onFormDataChange({ ...formData, name: e.target.value })}
                placeholder="请输入角色名称"
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
              <Label htmlFor="level">等级</Label>
              <Input
                id="level"
                type="number"
                value={formData.level}
                onChange={e =>
                  onFormDataChange({ ...formData, level: parseInt(e.target.value) || 0 })
                }
                placeholder="请输入等级"
                disabled={loading}
              />
            </div>
            <PagePermissionSelector
              pages={rolePages}
              selectedPages={formData.accessiblePages}
              publicPages={publicPages}
              loading={permissionsLoading}
              editing={editing}
              disabled={loading}
              onTogglePage={onTogglePage}
              onToggleAll={onToggleAllPages}
            />
            <ApiPermissionSelector
              apis={roleApis}
              selectedApis={formData.accessibleApis}
              publicApis={publicApis}
              loading={permissionsLoading}
              editing={editing}
              disabled={loading}
              onToggleApi={onToggleApi}
              onToggleMethod={onToggleMethod}
              onToggleAll={onToggleAllApis}
              onCrudOperationChange={onCrudOperationChange}
            />
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
