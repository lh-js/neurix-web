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
import type { GroupedRouterRecord } from '@/service/types/router'

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
  availableRoutes?: GroupedRouterRecord[]
  routesLoading?: boolean
  onRouteSelect?: (route: GroupedRouterRecord) => void
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
  availableRoutes = [],
  routesLoading = false,
  onRouteSelect,
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
              {!editing && availableRoutes.length > 0 ? (
                <>
                  <Select
                    value={formData.url || ''}
                    onValueChange={value => {
                      if (onRouteSelect && value) {
                        const route = availableRoutes.find(r => r.path === value)
                        if (route) {
                          onRouteSelect(route)
                        }
                      }
                    }}
                    disabled={loading || routesLoading}
                  >
                    <SelectTrigger id="url">
                      <SelectValue placeholder={routesLoading ? '加载中...' : '请选择接口'}>
                        {formData.url || ''}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoutes.map(route => (
                        <SelectItem key={route.path} value={route.path}>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{route.path}</span>
                            <span className="text-xs text-muted-foreground">
                              ({route.methods.length} 个方法)
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.url && (
                    <div className="mt-2 p-2 bg-muted rounded-md">
                      <p className="text-xs text-muted-foreground mb-1">该接口支持的方法：</p>
                      <div className="flex flex-wrap gap-1">
                        {availableRoutes
                          .find(r => r.path === formData.url)
                          ?.methods.map(method => (
                            <span
                              key={method}
                              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                            >
                              {method}
                            </span>
                          ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        已自动选中所有可用方法，您可以在下方取消不需要的方法
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={e => onFormDataChange({ ...formData, url: e.target.value })}
                    placeholder={editing ? '请输入URL' : '请先选择接口或手动输入URL'}
                    disabled={loading}
                  />
                  {editing && formData.url && availableRoutes.length > 0 && (
                    <div className="mt-2 p-2 bg-muted rounded-md">
                      <p className="text-xs text-muted-foreground mb-1">该接口支持的方法：</p>
                      <div className="flex flex-wrap gap-1">
                        {availableRoutes
                          .find(r => r.path === formData.url)
                          ?.methods.map(method => (
                            <span
                              key={method}
                              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                            >
                              {method}
                            </span>
                          )) || (
                          <span className="text-xs text-muted-foreground">
                            未找到该接口的路由信息
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
              {!editing && availableRoutes.length === 0 && !routesLoading && (
                <p className="text-sm text-muted-foreground">暂无可用接口，请手动输入URL</p>
              )}
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
                  {httpMethods.every(method => formData.methods.includes(method))
                    ? '取消全选'
                    : '全选'}
                </Button>
              </div>
              <div className="border rounded-md p-4 space-y-2">
                {(() => {
                  const selectedRoute =
                    !editing && formData.url
                      ? availableRoutes.find(r => r.path === formData.url)
                      : null
                  const supportedMethods = selectedRoute?.methods || []

                  return httpMethods.map(method => {
                    const isSupported = supportedMethods.includes(method)
                    const isSelected = formData.methods.includes(method)

                    return (
                      <div key={method} className="flex items-center space-x-2">
                        <Checkbox
                          id={`method-${method}`}
                          checked={isSelected}
                          onCheckedChange={() => onToggleMethod(method)}
                          disabled={loading}
                        />
                        <Label
                          htmlFor={`method-${method}`}
                          className="text-sm font-normal cursor-pointer flex items-center gap-2"
                        >
                          <span>{method}</span>
                          {!editing && selectedRoute && (
                            <span
                              className={`text-xs ${
                                isSupported
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {isSupported ? '(该接口支持)' : '(该接口不支持)'}
                            </span>
                          )}
                        </Label>
                      </div>
                    )
                  })
                })()}
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
