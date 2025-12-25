'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Checkbox } from '@/components/ui/checkbox'
import { RefreshCw } from 'lucide-react'

interface SyncDiff {
  toCreate: Array<{ url: string; methods: string[] }>
  toUpdate: Array<{ url: string; methods: string[] }>
  toDelete: Array<{ url: string; id: number }>
}

interface SyncDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCheck: (isPublic: boolean, checkExisting: boolean) => void
  onConfirm: () => void
  checking: boolean
  syncing: boolean
  progress: number
  currentItem?: string
  total: number
  completed: number
  syncDiff: SyncDiff | null
}

export function SyncDialog({
  open,
  onOpenChange,
  onCheck,
  onConfirm,
  checking,
  syncing,
  progress,
  currentItem,
  total,
  completed,
  syncDiff,
}: SyncDialogProps) {
  const [defaultIsPublic, setDefaultIsPublic] = React.useState<boolean>(false)
  const [checkExisting, setCheckExisting] = React.useState<boolean>(false)

  // 当对话框关闭且不在同步中时，重置状态
  React.useEffect(() => {
    if (!open && !syncing && !checking) {
      setDefaultIsPublic(false)
      setCheckExisting(false)
    }
  }, [open, syncing, checking])

  // 调试：检查 syncDiff 的值
  React.useEffect(() => {
    if (syncDiff) {
      console.log('[SyncDialog] syncDiff 已更新:', {
        toCreate: syncDiff.toCreate.length,
        toUpdate: syncDiff.toUpdate.length,
        toDelete: syncDiff.toDelete.length,
        total: syncDiff.toCreate.length + syncDiff.toUpdate.length + syncDiff.toDelete.length,
      })
    } else {
      console.log('[SyncDialog] syncDiff 为 null')
    }
  }, [syncDiff])

  const handleCheck = () => {
    onCheck(defaultIsPublic, checkExisting)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>一键同步接口权限</DialogTitle>
          <DialogDescription>
            {checking
              ? '正在检查差异...'
              : syncing
                ? '正在同步接口权限到数据库，请稍候...'
                : syncDiff
                  ? '请确认以下操作'
                  : '将路由列表中的接口同步到数据库，已存在的接口将跳过'}
          </DialogDescription>
        </DialogHeader>
        {checking ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-2">
                <Spinner className="h-6 w-6" />
                <span className="text-sm text-muted-foreground">正在检查差异...</span>
              </div>
            </div>
          </div>
        ) : syncDiff ? (
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              {syncDiff.toDelete.length > 0 && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-red-700 dark:text-red-400">
                      需要删除重复接口
                    </span>
                    <span className="text-sm font-bold text-red-700 dark:text-red-400">
                      {syncDiff.toDelete.length} 个
                    </span>
                  </div>
                </div>
              )}
              {syncDiff.toUpdate.length > 0 && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                      需要更新接口
                    </span>
                    <span className="text-sm font-bold text-yellow-700 dark:text-yellow-400">
                      {syncDiff.toUpdate.length} 个
                    </span>
                  </div>
                </div>
              )}
              {syncDiff.toCreate.length > 0 && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                      需要新增接口
                    </span>
                    <span className="text-sm font-bold text-green-700 dark:text-green-400">
                      {syncDiff.toCreate.length} 个
                    </span>
                  </div>
                </div>
              )}
              {syncDiff.toDelete.length === 0 &&
                syncDiff.toUpdate.length === 0 &&
                syncDiff.toCreate.length === 0 && (
                  <div className="p-3 bg-muted rounded-md text-center">
                    <span className="text-sm text-muted-foreground">
                      所有接口已存在且与路由一致，无需同步
                    </span>
                  </div>
                )}
            </div>
          </div>
        ) : !syncing ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="defaultIsPublic">默认是否公开</Label>
              <Select
                value={defaultIsPublic.toString()}
                onValueChange={value => setDefaultIsPublic(value === 'true')}
              >
                <SelectTrigger id="defaultIsPublic">
                  <SelectValue placeholder="请选择默认是否公开" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">是</SelectItem>
                  <SelectItem value="false">否</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="checkExisting"
                checked={checkExisting}
                onCheckedChange={checked => setCheckExisting(checked === true)}
              />
              <Label htmlFor="checkExisting" className="text-sm font-normal cursor-pointer">
                检查已存在的接口是否与路由一致（包括 URL 和 methods）
              </Label>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">同步进度</span>
                <span className="font-medium">
                  {total > 0 ? `${completed} / ${total}` : '0 / 0'}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${total > 0 ? progress : 0}%` }}
                />
              </div>
            </div>
            {currentItem && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>正在同步: {currentItem}</span>
              </div>
            )}
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={syncing || checking}
          >
            取消
          </Button>
          {checking ? (
            <Button disabled>
              <Spinner className="mr-2 h-4 w-4" />
              检查中...
            </Button>
          ) : syncDiff ? (
            <>
              <Button variant="outline" onClick={() => onCheck(defaultIsPublic, checkExisting)}>
                重新检查
              </Button>
              {syncDiff.toDelete.length > 0 ||
              syncDiff.toUpdate.length > 0 ||
              syncDiff.toCreate.length > 0 ? (
                <Button onClick={onConfirm}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  确认同步
                </Button>
              ) : (
                <Button onClick={() => onOpenChange(false)}>关闭</Button>
              )}
            </>
          ) : syncing ? (
            <Button disabled>
              <Spinner className="mr-2 h-4 w-4" />
              同步中...
            </Button>
          ) : (
            <Button onClick={handleCheck}>
              <RefreshCw className="h-4 w-4 mr-2" />
              检查差异
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
