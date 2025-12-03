'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import type { RolePage } from '@/service/types/role-page'

interface PagePermissionSelectorProps {
  pages: RolePage[]
  selectedPages: string[]
  publicPages: string[] // 保留用于接口一致性，但组件内部通过 page.isPublic 判断
  loading?: boolean
  editing?: boolean
  disabled?: boolean
  onTogglePage: (url: string) => void
  onToggleAll: (checked: boolean | 'indeterminate') => void
}

export function PagePermissionSelector({
  pages,
  selectedPages,
  publicPages: _publicPages, // eslint-disable-line @typescript-eslint/no-unused-vars
  loading = false,
  editing = false,
  disabled = false,
  onTogglePage,
  onToggleAll,
}: PagePermissionSelectorProps) {
  const allSelected = editing
    ? pages.every(page => selectedPages.includes(page.url))
    : pages.filter(page => !page.isPublic).every(page => selectedPages.includes(page.url))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>可访问页面</Label>
        {!loading && pages.length > 0 && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all-pages"
              checked={allSelected}
              onCheckedChange={onToggleAll}
              disabled={disabled}
            />
            <Label htmlFor="select-all-pages" className="text-sm font-normal cursor-pointer">
              全选
            </Label>
          </div>
        )}
      </div>
      <div className="border rounded-md p-4 max-h-48 overflow-y-auto space-y-2">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : pages.length > 0 ? (
          pages.map(page => {
            const isPublic = page.isPublic
            const isChecked = selectedPages.includes(page.url)
            const isPageDisabled = disabled || (!editing && isPublic)

            return (
              <div key={page.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`page-${page.id}`}
                  checked={isChecked}
                  onCheckedChange={() => onTogglePage(page.url)}
                  disabled={isPageDisabled}
                />
                <Label
                  htmlFor={`page-${page.id}`}
                  className={`text-sm font-normal flex-1 ${
                    isPageDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                  }`}
                >
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {page.url}
                      {isPublic && (
                        <span className="text-xs text-muted-foreground">(公共页面)</span>
                      )}
                    </div>
                    {page.description && (
                      <div className="text-xs text-muted-foreground">{page.description}</div>
                    )}
                  </div>
                </Label>
              </div>
            )
          })
        ) : (
          <p className="text-sm text-muted-foreground">暂无页面权限</p>
        )}
      </div>
    </div>
  )
}
