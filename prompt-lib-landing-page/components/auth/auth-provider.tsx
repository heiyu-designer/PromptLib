'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { simpleAuth, getCurrentUser } from '@/lib/simple-auth'
import { Database } from '@/lib/database'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
  user: { id: string; username: string; role: string } | null
  profile: Profile | null
  session: { user: { id: string; username: string; role: string } } | null
  loading: boolean
  signIn: (username: string, password: string) => Promise<{ error: string | null }>
  signUp: (username: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; username: string; role: string } | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<{ user: { id: string; username: string; role: string } } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 检查本地存储中的用户
    const storedUser = getCurrentUser()
    if (storedUser) {
      setUser({ id: 'local-user', username: storedUser.username, role: storedUser.role })
      setSession({ user: { id: 'local-user', username: storedUser.username, role: storedUser.role } })
    }
    setLoading(false)
  }, [])

  const signIn = async (username: string, password: string): Promise<{ error: string | null }> => {
    const result = await simpleAuth(username, password)
    if (result.success && result.user) {
      setUser({ id: 'local-user', username: result.user.username, role: result.user.role })
      setSession({ user: { id: 'local-user', username: result.user.username, role: result.user.role } })
      return { error: null }
    }
    return { error: result.error || '登录失败' }
  }

  const signUp = async (username: string, password: string): Promise<{ error: string | null }> => {
    // 本地认证不支持注册
    return { error: '注册功能暂不可用' }
  }

  const signOut = async (): Promise<void> => {
    const { logout } = await import('@/lib/simple-auth')
    logout()
    setUser(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// 便捷的 admin 检查 hook
export function useIsAdmin() {
  const { user } = useAuth()
  return user?.role === 'admin'
}
