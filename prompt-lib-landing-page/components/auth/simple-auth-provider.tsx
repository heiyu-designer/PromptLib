'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface SimpleUser {
  username: string
  role: string
}

interface SimpleAuthContextType {
  user: SimpleUser | null
  isAuthenticated: boolean
  loading: boolean
  login: (username: string, role: string) => void
  logout: () => void
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined)

export function SimpleAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SimpleUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 检查 localStorage 中的登录状态
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn')
      const username = localStorage.getItem('username')
      const role = localStorage.getItem('userRole')

      if (isLoggedIn === 'true' && username && role) {
        setUser({ username, role })
      } else {
        setUser(null)
      }
      setLoading(false)
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

  const login = (username: string, role: string) => {
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('username', username)
    localStorage.setItem('userRole', role)
    setUser({ username, role })
  }

  const logout = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('username')
    localStorage.removeItem('userRole')
    setUser(null)
  }

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout
  }

  return <SimpleAuthContext.Provider value={value}>{children}</SimpleAuthContext.Provider>
}

export function useSimpleAuth() {
  const context = useContext(SimpleAuthContext)
  if (context === undefined) {
    console.error('useSimpleAuth called outside SimpleAuthProvider')
    // 返回默认值而不是抛出错误
    return {
      user: null,
      isAuthenticated: false,
      loading: false,
      login: () => {},
      logout: () => {}
    }
  }
  return context
}

export function useSimpleIsAdmin() {
  try {
    const { user, isAuthenticated, loading } = useSimpleAuth()
    if (loading) return false
    return isAuthenticated && user?.role === 'admin'
  } catch (error) {
    console.error('Error in useSimpleIsAdmin:', error)
    return false
  }
}