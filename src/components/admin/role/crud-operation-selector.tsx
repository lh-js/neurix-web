'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

type CrudOperation = 'create' | 'read' | 'update' | 'delete'

interface CrudOperationSelectorProps {
  operations: CrudOperation[]
  checkedStates: Record<CrudOperation, boolean>
  onOperationChange: (operation: CrudOperation) => void
  disabled?: boolean
}

const operationLabels: Record<CrudOperation, string> = {
  read: '查',
  create: '增',
  update: '改',
  delete: '删',
}

export function CrudOperationSelector({
  operations,
  checkedStates,
  onOperationChange,
  disabled = false,
}: CrudOperationSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      {operations.map(operation => (
        <div key={operation} className="flex items-center space-x-2">
          <Checkbox
            id={`crud-${operation}`}
            checked={checkedStates[operation]}
            onCheckedChange={() => onOperationChange(operation)}
            disabled={disabled}
          />
          <Label htmlFor={`crud-${operation}`} className="text-sm font-normal cursor-pointer">
            {operationLabels[operation]}
          </Label>
        </div>
      ))}
    </div>
  )
}
