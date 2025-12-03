import { Home, User, Shield } from 'lucide-react'
import { LucideIcon } from 'lucide-react'

/**
 * 菜单项类型
 */
export type MenuItemType = 'link' | 'group'

/**
 * 基础菜单项
 */
export interface BaseMenuItem {
  id: string
  label: string
  icon: LucideIcon
  href?: string
  defaultOpen?: boolean
}

/**
 * 链接菜单项
 */
export interface LinkMenuItem extends BaseMenuItem {
  type: 'link'
  href: string
}

/**
 * 分组菜单项（可折叠）
 */
export interface GroupMenuItem extends BaseMenuItem {
  type: 'group'
  children: LinkMenuItem[]
  // 用于判断分组是否激活（当子菜单项激活时，分组也显示为激活状态）
  activePaths?: string[]
}

/**
 * 菜单项
 */
export type MenuItem = LinkMenuItem | GroupMenuItem

/**
 * 侧边栏菜单配置
 */
export const sidebarMenuConfig: MenuItem[] = [
  {
    id: 'admin-home',
    type: 'link',
    label: '管理员首页',
    icon: Home,
    href: '/admin',
  },
  {
    id: 'permission-management',
    type: 'group',
    label: '用户权限管理',
    icon: Shield,
    defaultOpen: true,
    activePaths: ['/admin/user', '/admin/role-url', '/admin/role', '/admin/role-page'],
    children: [
      {
        id: 'user-management',
        type: 'link',
        label: '用户管理',
        icon: User,
        href: '/admin/user',
      },
      {
        id: 'role-management',
        type: 'link',
        label: '用户权限管理',
        icon: Shield,
        href: '/admin/role',
      },
      {
        id: 'role-page-management',
        type: 'link',
        label: '页面权限',
        icon: Shield,
        href: '/admin/role-page',
      },
      {
        id: 'role-url-management',
        type: 'link',
        label: '权限URL',
        icon: Shield,
        href: '/admin/role-url',
      },
    ],
  },
]
