// 简单的认证检查工具函数

// 硬编码的用户验证（适合演示）
const VALID_USERS = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'heiyu', password: '123456', role: 'user' }
]

// 简单的认证函数
export async function simpleAuth(username: string, password: string): Promise<{ success: boolean; user?: { username: string; role: string }; error?: string }> {
  const validUser = VALID_USERS.find(u => u.username === username && u.password === password)

  if (!validUser) {
    return { success: false, error: '用户名或密码错误' }
  }

  // 存储到 localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('username', validUser.username)
    localStorage.setItem('userRole', validUser.role)
  }

  return {
    success: true,
    user: { username: validUser.username, role: validUser.role }
  }
}
export function isLoggedIn() {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem('isLoggedIn') === 'true'
  } catch {
    return false
  }
}

export function getCurrentUser() {
  if (typeof window === 'undefined') return null
  try {
    const username = localStorage.getItem('username')
    const role = localStorage.getItem('userRole')
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

    if (!isLoggedIn || !username || !role) return null

    return { username, role }
  } catch {
    return null
  }
}

export function isCurrentUserAdmin() {
  try {
    const user = getCurrentUser()
    return user?.role === 'admin'
  } catch {
    return false
  }
}

// 开发环境：快速设置管理员权限
export function setDevAdmin() {
  if (typeof window === 'undefined') return
  if (process.env.NODE_ENV === 'development') {
    try {
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('username', 'dev-admin')
      localStorage.setItem('userRole', 'admin')
      return true
    } catch {
      return false
    }
  }
  return false
}

export function logout() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('username')
    localStorage.removeItem('userRole')
  } catch {
    // 忽略错误
  }
}