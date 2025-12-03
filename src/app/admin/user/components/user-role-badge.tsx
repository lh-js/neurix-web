'use client'

import { Role } from '@/service/types/role'

interface UserRoleBadgeProps {
  roleId: number
  roles: Role[]
}

export function UserRoleBadge({ roleId, roles }: UserRoleBadgeProps) {
  const getRoleName = (id: number): string => {
    const role = roles.find(r => r.id === id)
    return role?.name || `角色 ${id}`
  }

  const getRoleBadgeClass = (id: number): string => {
    // 为不同角色ID设置不同的颜色方案
    const roleColors: Record<number, string> = {
      1: 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400', // 管理员 - 蓝色
      2: 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400', // 绿色
      3: 'bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400', // 紫色
      4: 'bg-orange-500/10 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400', // 橙色
      5: 'bg-pink-500/10 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400', // 粉色
      6: 'bg-cyan-500/10 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400', // 青色
      7: 'bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400', // 靛蓝色
      8: 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400', // 琥珀色
      9: 'bg-teal-500/10 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400', // 蓝绿色
      10: 'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400', // 红色
    }

    if (roleColors[id]) {
      return roleColors[id]
    }

    const colorPalette = [
      'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
      'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400',
      'bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
      'bg-orange-500/10 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
      'bg-pink-500/10 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400',
      'bg-cyan-500/10 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400',
      'bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400',
      'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
      'bg-teal-500/10 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400',
      'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400',
    ]

    const colorIndex = (id - 1) % colorPalette.length
    return colorPalette[colorIndex]
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeClass(
        roleId
      )}`}
    >
      {getRoleName(roleId)}
    </span>
  )
}
