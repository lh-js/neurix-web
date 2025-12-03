'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface BooleanFilterProps {
  label: string
  value: 'all' | 'true' | 'false'
  onChange: (value: 'all' | 'true' | 'false') => void
  placeholder?: string
  trueLabel?: string
  falseLabel?: string
  allLabel?: string
}

export function BooleanFilter({
  label,
  value,
  onChange,
  placeholder = '全部',
  trueLabel = '是',
  falseLabel = '否',
  allLabel = '全部',
}: BooleanFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Label className="text-sm whitespace-nowrap">{label}</Label>
      <Select value={value} onValueChange={val => onChange(val as 'all' | 'true' | 'false')}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{allLabel}</SelectItem>
          <SelectItem value="true">{trueLabel}</SelectItem>
          <SelectItem value="false">{falseLabel}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
