'use client'

import { ReactNode } from 'react'
import { Button, ButtonProps } from '@/components/ui/button'
import { useAuth } from '@/hooks/common/use-auth'

interface PermissionButtonProps extends ButtonProps {
  permissionKey: string
  fallback?: ReactNode
}

function PermissionButtonBase({
  permissionKey,
  fallback = null,
  children,
  ...buttonProps
}: PermissionButtonProps) {
  const { accessibleElements } = useAuth()
  const hasPermission = accessibleElements?.includes(permissionKey)

  if (!hasPermission) {
    return fallback ? <>{fallback}</> : null
  }

  return <Button {...buttonProps}>{children}</Button>
}

type PermissionActionButtonProps = Omit<PermissionButtonProps, 'permissionKey'>

export function CreatePermissionButton(props: PermissionActionButtonProps) {
  return <PermissionButtonBase permissionKey="admin-create-button" {...props} />
}

export function EditPermissionButton(props: PermissionActionButtonProps) {
  return <PermissionButtonBase permissionKey="admin-edit-button" {...props} />
}

export function DeletePermissionButton(props: PermissionActionButtonProps) {
  return <PermissionButtonBase permissionKey="admin-delete-button" {...props} />
}
