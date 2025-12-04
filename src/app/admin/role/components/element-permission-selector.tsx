'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import type { RoleElement } from '@/service/types/role-element'

interface ElementPermissionSelectorProps {
  elements: RoleElement[]
  selectedElements: string[]
  loading?: boolean
  disabled?: boolean
  onToggleElement: (key: string) => void
  onToggleAll: (checked: boolean | 'indeterminate') => void
}

export function ElementPermissionSelector({
  elements,
  selectedElements,
  loading = false,
  disabled = false,
  onToggleElement,
  onToggleAll,
}: ElementPermissionSelectorProps) {
  const allSelectableKeys = elements.map(element => element.key)
  const allSelected =
    allSelectableKeys.length > 0 &&
    allSelectableKeys.every(key => selectedElements.includes(key))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>可访问元素</Label>
        {!loading && elements.length > 0 && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all-elements"
              checked={allSelected}
              onCheckedChange={onToggleAll}
              disabled={disabled}
            />
            <Label htmlFor="select-all-elements" className="text-sm font-normal cursor-pointer">
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
        ) : elements.length > 0 ? (
          elements.map(element => {
            const isChecked = selectedElements.includes(element.key)
            return (
              <div key={element.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`element-${element.id}`}
                  checked={isChecked}
                  onCheckedChange={() => onToggleElement(element.key)}
                  disabled={disabled}
                />
                <Label
                  htmlFor={`element-${element.id}`}
                  className={`text-sm font-normal flex-1 ${
                    disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                  }`}
                >
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {element.name}
                      <span className="text-xs text-muted-foreground font-mono">{element.key}</span>
                    </div>
                    {element.description && (
                      <div className="text-xs text-muted-foreground">{element.description}</div>
                    )}
                  </div>
                </Label>
              </div>
            )
          })
        ) : (
          <p className="text-sm text-muted-foreground">暂无元素权限</p>
        )}
      </div>
    </div>
  )
}

