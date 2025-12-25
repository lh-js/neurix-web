'use client'

import { Button } from '@/components/ui/button'
import { Plus, MessageSquare, Trash2, Edit2 } from 'lucide-react'
import { ChatSession } from '@/service/types/chat'
import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { Spinner } from '@/components/ui/spinner'

interface SessionListProps {
  sessions: ChatSession[]
  currentSessionId: number | null
  loading?: boolean
  loadingMessages?: Set<number>
  deletingSessionId?: number | null
  creatingSession?: boolean
  updatingTitleSessionId?: number | null
  onSelectSession: (sessionId: number) => void
  onCreateSession: () => void
  onDeleteSession: (sessionId: number) => void
  onUpdateTitle: (sessionId: number, title: string) => void
}

export function SessionList({
  sessions,
  currentSessionId,
  loading = false,
  loadingMessages = new Set(),
  deletingSessionId = null,
  creatingSession = false,
  updatingTitleSessionId = null,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onUpdateTitle,
}: SessionListProps) {
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<number | null>(null)
  const previousUpdatingTitleSessionIdRef = useRef<number | null>(null)
  const [swipedSessionId, setSwipedSessionId] = useState<number | null>(null)
  const touchStartXRef = useRef<number | null>(null)

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const handleEditClick = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingSessionId(session.id.toString())
    setEditTitle(session.title)
  }

  const handleSaveEdit = async () => {
    if (editingSessionId && editTitle.trim()) {
      await onUpdateTitle(Number.parseInt(editingSessionId, 10), editTitle.trim())
    }
  }

  // 监听更新完成，自动关闭对话框
  useEffect(() => {
    // 如果之前有正在更新的会话，现在更新完成了（updatingTitleSessionId 变为 null）
    if (
      previousUpdatingTitleSessionIdRef.current !== null &&
      updatingTitleSessionId === null &&
      editingSessionId
    ) {
      // 更新完成，关闭对话框
      setEditingSessionId(null)
      setEditTitle('')
      previousUpdatingTitleSessionIdRef.current = null
    } else if (updatingTitleSessionId !== null) {
      // 记录正在更新的会话 ID
      previousUpdatingTitleSessionIdRef.current = updatingTitleSessionId
    }
  }, [updatingTitleSessionId, editingSessionId])

  const handleDeleteClick = (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setSessionToDelete(sessionId)
    setDeleteConfirmOpen(true)
  }

  const handleTouchStart = (sessionId: number, e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX
  }

  const handleTouchMove = (sessionId: number, e: React.TouchEvent) => {
    const startX = touchStartXRef.current
    if (startX === null) return
    const deltaX = e.touches[0].clientX - startX
    // 左划超过 30px 显示操作按钮
    if (deltaX < -30) {
      setSwipedSessionId(sessionId)
    }
    // 右划超过 20px 收起
    if (deltaX > 20 && swipedSessionId === sessionId) {
      setSwipedSessionId(null)
    }
  }

  const handleTouchEnd = () => {
    touchStartXRef.current = null
  }

  const handleConfirmDelete = async () => {
    if (sessionToDelete !== null) {
      await onDeleteSession(sessionToDelete)
      setDeleteConfirmOpen(false)
      setSessionToDelete(null)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background border-r border-border/40">
      {/* 新建会话按钮 */}
      <div className="p-4 border-b border-border/40">
        <Button onClick={onCreateSession} className="w-full" size="sm" disabled={creatingSession}>
          {creatingSession ? (
            <>
              <Spinner className="h-4 w-4 mr-2" />
              创建中...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              新建对话
            </>
          )}
        </Button>
      </div>

      {/* 会话列表 */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner className="h-6 w-6" />
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {sessions.map(session => {
              const isActive = session.id === currentSessionId
              const isLoadingMessages = loadingMessages.has(session.id)
              const isSwiped = swipedSessionId === session.id
              return (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  onTouchStart={e => handleTouchStart(session.id, e)}
                  onTouchMove={e => handleTouchMove(session.id, e)}
                  onTouchEnd={handleTouchEnd}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-colors overflow-hidden ${
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div
                    className="flex items-start gap-2 pr-14 md:pr-14"
                    style={{
                      transform: isSwiped ? 'translateX(-96px)' : 'translateX(0)',
                      transition: 'transform 0.2s ease',
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="font-medium text-sm flex items-center gap-2">
                        <span className="truncate block">{session.title}</span>
                        {isLoadingMessages && <Spinner className="h-3 w-3 flex-shrink-0" />}
                      </div>
                      <div className="text-xs mt-1 opacity-70 truncate">
                        {formatTime(session.updatedAt)}
                      </div>
                    </div>
                  </div>
                  {/* 操作按钮：桌面悬停显示，移动端左划显示 */}
                  <div
                    className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10 rounded px-1 py-0.5 transition-opacity ${
                      isSwiped ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    } ${isActive ? 'bg-accent text-accent-foreground' : 'bg-transparent'}`}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-6 w-6 ${
                        isActive ? 'hover:bg-accent/60' : 'hover:bg-accent/40'
                      }`}
                      onClick={e => handleEditClick(session, e)}
                      disabled={deletingSessionId !== null}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-6 w-6 text-destructive hover:text-destructive ${
                        isActive ? 'hover:bg-accent/60' : 'hover:bg-accent/40'
                      }`}
                      onClick={e => handleDeleteClick(session.id, e)}
                      disabled={deletingSessionId !== null || isLoadingMessages}
                    >
                      {deletingSessionId === session.id ? (
                        <Spinner className="h-3 w-3" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 编辑标题对话框 */}
      <Dialog
        open={editingSessionId !== null}
        onOpenChange={open => {
          if (!open && updatingTitleSessionId === null) {
            setEditingSessionId(null)
            setEditTitle('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑会话标题</DialogTitle>
            <DialogDescription>为这个会话设置一个标题</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">标题</Label>
              <Input
                id="title"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                onKeyPress={e => {
                  if (e.key === 'Enter' && !updatingTitleSessionId) {
                    handleSaveEdit()
                  }
                }}
                placeholder="输入会话标题"
                autoFocus
                disabled={updatingTitleSessionId !== null}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingSessionId(null)
                setEditTitle('')
              }}
              disabled={updatingTitleSessionId !== null}
            >
              取消
            </Button>
            <Button onClick={handleSaveEdit} disabled={updatingTitleSessionId !== null}>
              {updatingTitleSessionId !== null ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  保存中...
                </>
              ) : (
                '保存'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="确认删除会话"
        description="确定要删除这个会话吗？此操作无法撤销，所有聊天记录将被永久删除。"
        deleting={deletingSessionId !== null}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false)
          setSessionToDelete(null)
        }}
      />
    </div>
  )
}
