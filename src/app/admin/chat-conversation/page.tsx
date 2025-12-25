'use client'

import { useState } from 'react'
import {
  useChatConversationList,
  useConversationMessages,
} from '@/hooks/admin/chat-conversation/use-chat-conversation'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MessageSquare, Eye } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { DataTable } from '@/components/common/data-table'
import { MarkdownContent } from '@/components/chat/markdown-content'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Bot, User } from 'lucide-react'
import type { ChatConversation } from '@/service/types/chat-conversation'

export default function ChatConversationPage() {
  const { data, loading, error, handlePageChange } = useChatConversationList()
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
  } = useConversationMessages(selectedConversation?.id || null)

  const handleViewDetails = (record: ChatConversation) => {
    setSelectedConversation(record)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedConversation(null)
  }

  const columns: Array<{
    key: string
    header: string
    render: (item: ChatConversation) => React.ReactNode
    className?: string
  }> = [
    {
      key: 'id',
      header: 'ID',
      render: item => <span className="text-muted-foreground whitespace-nowrap">{item.id}</span>,
    },
    {
      key: 'userId',
      header: '用户ID',
      render: item => <span className="text-sm whitespace-nowrap">{item.userId}</span>,
    },
    {
      key: 'email',
      header: '邮箱',
      render: item => (
        <span className="text-sm whitespace-nowrap" title={item.email}>
          {item.email}
        </span>
      ),
    },
    {
      key: 'title',
      header: '会话标题',
      render: item => (
        <span className="text-sm whitespace-nowrap" title={item.title}>
          {item.title}
        </span>
      ),
    },
    {
      key: 'createTime',
      header: '创建时间',
      render: item => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {item.createTime ? new Date(item.createTime).toLocaleString('zh-CN') : '-'}
        </span>
      ),
    },
    {
      key: 'updateTime',
      header: '更新时间',
      render: item => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {item.updateTime ? new Date(item.updateTime).toLocaleString('zh-CN') : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '操作',
      render: item => (
        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(item)}>
          <Eye className="h-4 w-4 mr-1" />
          查看消息
        </Button>
      ),
      className: 'sticky right-0',
    },
  ]

  return (
    <>
      <PageHeader title="聊天会话日志" icon={MessageSquare} />

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <DataTable
        columns={columns}
        data={data?.list || []}
        loading={loading}
        pagination={
          data
            ? {
                total: data.total,
                page: data.page,
                totalPages: Math.ceil(data.total / data.pageSize),
                hasPreviousPage: data.page > 1,
                hasNextPage: data.page < Math.ceil(data.total / data.pageSize),
              }
            : undefined
        }
        onPageChange={handlePageChange}
        emptyMessage="暂无聊天会话记录"
        emptyIcon={<MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />}
      />

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>会话消息记录</DialogTitle>
            <DialogDescription>
              {selectedConversation && (
                <>
                  会话ID: {selectedConversation.id} | 用户: {selectedConversation.email} | 标题:{' '}
                  {selectedConversation.title}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2">
            {messagesError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{messagesError.message}</AlertDescription>
              </Alert>
            )}

            {messagesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">加载消息中...</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">暂无消息记录</div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map(message => {
                  const isUser = message.role === 'user'
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            <Bot className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={`flex flex-col gap-1 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`group relative rounded-2xl px-4 py-2 transition-all duration-300 ${
                            isUser
                              ? 'bg-primary text-primary-foreground shadow-lg'
                              : 'bg-muted shadow-sm'
                          }`}
                        >
                          <div className="break-words text-sm">
                            {isUser ? (
                              <div className="whitespace-pre-wrap">{message.content}</div>
                            ) : (
                              <MarkdownContent content={message.content} />
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground px-2">
                          {new Date(message.createTime).toLocaleString('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </div>
                      </div>

                      {isUser && (
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className="bg-secondary text-secondary-foreground">
                            <User className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
