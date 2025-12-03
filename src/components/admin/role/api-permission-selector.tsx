'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import type { RoleApi } from '@/service/types/role-api'
import type { AccessibleApi } from '@/service/types/role'
import { CrudOperationSelector } from './crud-operation-selector'

type CrudOperation = 'create' | 'read' | 'update' | 'delete'

interface ApiPermissionSelectorProps {
  apis: RoleApi[]
  selectedApis: AccessibleApi[]
  publicApis: AccessibleApi[]
  loading?: boolean
  editing?: boolean
  disabled?: boolean
  onToggleApi: (url: string) => void
  onToggleMethod: (url: string, method: string) => void
  onToggleAll: (checked: boolean | 'indeterminate') => void
  onCrudOperationChange: (operation: CrudOperation) => void
}

const operationMethods: Record<CrudOperation, string[]> = {
  create: ['POST'],
  read: ['GET'],
  update: ['PUT', 'PATCH'],
  delete: ['DELETE'],
}

export function ApiPermissionSelector({
  apis,
  selectedApis,
  publicApis,
  loading = false,
  editing = false,
  disabled = false,
  onToggleApi,
  onToggleMethod,
  onToggleAll,
  onCrudOperationChange,
}: ApiPermissionSelectorProps) {
  // 计算全选状态
  const allSelected = apis.every(api => {
    const selectedApi = selectedApis.find(a => a.url === api.url)
    if (!selectedApi) return false
    const apiMethods = api.method || []
    return apiMethods.every(method => selectedApi.method.includes(method))
  })

  // 计算增删改查的状态
  const crudStates: Record<CrudOperation, boolean> = {
    read: apis.every(api => {
      const supportedMethods = operationMethods.read.filter(method => api.method?.includes(method))
      if (supportedMethods.length === 0) return true
      const selectedApi = selectedApis.find(a => a.url === api.url)
      if (!selectedApi) return false
      return supportedMethods.every(method => selectedApi.method.includes(method))
    }),
    create: apis.every(api => {
      const supportedMethods = operationMethods.create.filter(method =>
        api.method?.includes(method)
      )
      if (supportedMethods.length === 0) return true
      const selectedApi = selectedApis.find(a => a.url === api.url)
      if (!selectedApi) return false
      return supportedMethods.every(method => selectedApi.method.includes(method))
    }),
    update: apis.every(api => {
      const supportedMethods = operationMethods.update.filter(method =>
        api.method?.includes(method)
      )
      if (supportedMethods.length === 0) return true
      const selectedApi = selectedApis.find(a => a.url === api.url)
      if (!selectedApi) return false
      return supportedMethods.every(method => selectedApi.method.includes(method))
    }),
    delete: apis.every(api => {
      const supportedMethods = operationMethods.delete.filter(method =>
        api.method?.includes(method)
      )
      if (supportedMethods.length === 0) return true
      const selectedApi = selectedApis.find(a => a.url === api.url)
      if (!selectedApi) return false
      return supportedMethods.every(method => selectedApi.method.includes(method))
    }),
  }

  // 检查哪些操作有支持的接口
  const availableOperations: CrudOperation[] = []
  if (apis.some(api => api.method?.some(m => operationMethods.read.includes(m)))) {
    availableOperations.push('read')
  }
  if (apis.some(api => api.method?.some(m => operationMethods.create.includes(m)))) {
    availableOperations.push('create')
  }
  if (apis.some(api => api.method?.some(m => operationMethods.update.includes(m)))) {
    availableOperations.push('update')
  }
  if (apis.some(api => api.method?.some(m => operationMethods.delete.includes(m)))) {
    availableOperations.push('delete')
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>可访问接口</Label>
        {!loading && apis.length > 0 && (
          <div className="flex items-center gap-4">
            {/* 增删改查快捷选择 */}
            {availableOperations.length > 0 && (
              <CrudOperationSelector
                operations={availableOperations}
                checkedStates={crudStates}
                onOperationChange={onCrudOperationChange}
                disabled={disabled}
              />
            )}
            {/* 全选复选框 */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all-apis"
                checked={allSelected}
                onCheckedChange={onToggleAll}
                disabled={disabled}
              />
              <Label htmlFor="select-all-apis" className="text-sm font-normal cursor-pointer">
                全选
              </Label>
            </div>
          </div>
        )}
      </div>
      <div className="border rounded-md p-4 max-h-96 overflow-y-auto space-y-4">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : apis.length > 0 ? (
          apis.map(api => {
            const selectedApi = selectedApis.find(a => a.url === api.url)
            const isApiSelected = !!selectedApi
            const availableMethods = api.method || []
            const isPublic = api.isPublic
            const isApiDisabled = disabled || (!editing && isPublic)

            return (
              <div key={api.id} className="space-y-2 border-b last:border-b-0 pb-3 last:pb-0">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`api-${api.id}`}
                    checked={isApiSelected}
                    onCheckedChange={() => onToggleApi(api.url)}
                    disabled={isApiDisabled}
                  />
                  <Label
                    htmlFor={`api-${api.id}`}
                    className={`text-sm font-normal flex-1 ${
                      isApiDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                    }`}
                  >
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {api.url}
                        {isPublic && (
                          <span className="text-xs text-muted-foreground">(公共接口)</span>
                        )}
                      </div>
                      {api.description && (
                        <div className="text-xs text-muted-foreground">{api.description}</div>
                      )}
                    </div>
                  </Label>
                </div>
                {isApiSelected && availableMethods.length > 0 && (
                  <div className="pl-6 space-y-2">
                    <div className="text-xs text-muted-foreground">选择 HTTP 方法：</div>
                    <div className="flex flex-wrap gap-2">
                      {availableMethods.map(method => {
                        const isMethodSelected = selectedApi?.method.includes(method) || false
                        const isMethodDisabled =
                          disabled ||
                          (!editing &&
                            isPublic &&
                            publicApis.some(pa => pa.url === api.url && pa.method.includes(method)))

                        return (
                          <div key={method} className="flex items-center space-x-1">
                            <Checkbox
                              id={`api-${api.id}-method-${method}`}
                              checked={isMethodSelected}
                              onCheckedChange={() => onToggleMethod(api.url, method)}
                              disabled={isMethodDisabled}
                            />
                            <Label
                              htmlFor={`api-${api.id}-method-${method}`}
                              className={`text-xs font-normal ${
                                isMethodDisabled
                                  ? 'cursor-not-allowed opacity-60'
                                  : 'cursor-pointer'
                              }`}
                            >
                              {method}
                            </Label>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <p className="text-sm text-muted-foreground">暂无接口权限</p>
        )}
      </div>
    </div>
  )
}
