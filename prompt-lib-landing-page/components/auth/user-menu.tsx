'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { User, LogOut, Settings, LayoutDashboard, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth, useIsAdmin } from './auth-provider'
import { getCurrentUser, isCurrentUserAdmin as isSimpleAdmin, logout } from '@/lib/simple-auth'

export default function UserMenu() {
  const { user, profile, signOut } = useAuth()
  const isAdmin = useIsAdmin()
  const [simpleUser, setSimpleUser] = useState<{username: string; role: string} | null>(null)
  const [isSimpleUserAdmin, setIsSimpleUserAdmin] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = getCurrentUser()
      setSimpleUser(currentUser)
      setIsSimpleUserAdmin(isSimpleAdmin())
    }

    checkAuth()

    // 监听 storage 变化（多标签页同步）
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'isLoggedIn' || e.key === 'username' || e.key === 'userRole') {
        checkAuth()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // 优先使用简单登录，如果没有则使用 Supabase 登录
  const currentUser = simpleUser || (user ? { username: profile?.username || user.email || '未知用户', email: user.email } : null)
  const isCurrentUserAdmin = isSimpleUserAdmin || isAdmin

  if (!currentUser) {
    return (
      <Link href="/login">
        <Button variant="ghost">登录</Button>
      </Link>
    )
  }

  const handleSignOut = async () => {
    // 显示确认对话框
    if (!confirm("确定要退出登录吗？")) {
      return
    }

    try {
      if (simpleUser) {
        logout()
      } else {
        await signOut()
      }

      // 显示成功提示并刷新页面
      alert("退出登录成功！")
      window.location.reload()
    } catch (error) {
      console.error('退出登录失败:', error)
      alert("退出登录失败，请稍后重试")
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || ''} alt={currentUser.username} />
            <AvatarFallback>
              {getInitials(currentUser.username)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{currentUser.username}</p>
            {currentUser.email && (
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {currentUser.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            个人资料
          </Link>
        </DropdownMenuItem>
        {isCurrentUserAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              管理后台
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={(event) => {
            event.preventDefault()
            handleSignOut()
          }}
        >
          <LogOut className="h-4 w-4" />
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}