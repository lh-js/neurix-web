'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { LOGIN_PATH } from '@/config/auth.config'

interface LoginConfirmDialogData {
  title: string
  description: string
  onConfirm?: () => void
}

/**
 * 通用的登录确认弹窗组件
 * 监听全局的登录确认事件，显示不同原因的登录提示
 */
export function LoginConfirmDialog() {
  const [open, setOpen] = useState(false)
  const [dialogData, setDialogData] = useState<LoginConfirmDialogData | null>(null)
  const router = useRouter()

  useEffect(() => {
    // 监听登录确认事件
    const handleLoginConfirm = (event: CustomEvent<LoginConfirmDialogData>) => {
      setDialogData(event.detail)
      setOpen(true)
    }

    // 监听自定义事件
    window.addEventListener('login:confirm', handleLoginConfirm as EventListener)

    return () => {
      window.removeEventListener('login:confirm', handleLoginConfirm as EventListener)
    }
  }, [])

  const handleLogin = () => {
    // 关闭弹窗
    setOpen(false)
    // 执行自定义回调（如果有）
    if (dialogData?.onConfirm) {
      dialogData.onConfirm()
    }
    // 跳转到登录页面
    router.push(LOGIN_PATH)
  }

  const handleCancel = () => {
    // 关闭弹窗
    setOpen(false)
    // 清空数据
    setDialogData(null)
  }

  if (!dialogData) {
    return null
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{dialogData.title}</AlertDialogTitle>
          <AlertDialogDescription>{dialogData.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>取消</AlertDialogCancel>
          <AlertDialogAction onClick={handleLogin}>前往登录</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/**
 * 触发登录确认弹窗的工具函数
 * @param title 弹窗标题
 * @param description 弹窗描述（说明跳转原因）
 * @param onConfirm 确认后的回调函数（可选）
 */
export function showLoginConfirmDialog(title: string, description: string, onConfirm?: () => void) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent<LoginConfirmDialogData>('login:confirm', {
        detail: { title, description, onConfirm },
      })
    )
  }
}
