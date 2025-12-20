// 简单的认证检查工具函数
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