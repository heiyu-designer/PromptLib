'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { query } from '@/lib/server-db'

// Input validation schemas
const updateUserSchema = z.object({
  id: z.string(),
  username: z.string().min(1, '用户名不能为空').max(50, '用户名不能超过50字符').optional(),
  avatar_url: z.string().url('请输入有效的头像URL').optional().nullable(),
  role: z.enum(['user', 'admin']).optional(),
  status: z.enum(['active', 'banned']).optional(),
  must_change_password: z.boolean().optional(),
})

// Types
type UpdateUserInput = z.infer<typeof updateUserSchema>

// Get all users
export async function getUsers(params?: {
  page?: number
  limit?: number
  role?: 'user' | 'admin'
  status?: 'active' | 'banned'
  search?: string
}) {
  try {
    const page = params?.page || 1
    const limit = params?.limit || 20
    const offset = (page - 1) * limit

    let whereConditions: string[] = []
    let queryParams: any[] = []
    let paramIndex = 1

    if (params?.role) {
      whereConditions.push(`role = $${paramIndex++}`)
      queryParams.push(params.role)
    }

    if (params?.status) {
      whereConditions.push(`status = $${paramIndex++}`)
      queryParams.push(params.status)
    }

    if (params?.search) {
      whereConditions.push(`(username ILIKE $${paramIndex} OR avatar_url ILIKE $${paramIndex})`)
      queryParams.push(`%${params.search}%`)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''

    // Get total count
    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM profiles ${whereClause}`,
      queryParams
    )
    const total = parseInt(countResult.data?.[0]?.count || '0', 10)

    // Get users
    queryParams.push(limit, offset)
    const usersResult = await query(
      `SELECT * FROM profiles ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      queryParams
    )

    if (usersResult.error) {
      console.error('Error fetching users:', usersResult.error)
      return { users: [], total: 0, error: String(usersResult.error) }
    }

    return {
      users: usersResult.data || [],
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      error: null
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { users: [], total: 0, error: '获取用户时发生错误' }
  }
}

// Get single user by ID
export async function getUserById(id: string) {
  try {
    const result = await query(
      'SELECT * FROM profiles WHERE id = $1',
      [id]
    )

    if (result.error) {
      console.error('Error fetching user:', result.error)
      return { user: null, error: String(result.error) }
    }

    return { user: result.data?.[0] || null, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { user: null, error: '获取用户时发生错误' }
  }
}

// Update user
export async function updateUser(input: UpdateUserInput) {
  try {
    const validatedData = updateUserSchema.parse(input)
    const { id, ...updateFields } = validatedData

    const updateParts: string[] = []
    const values: any[] = []
    let i = 1

    if (updateFields.username !== undefined) {
      updateParts.push(`username = $${i++}`)
      values.push(updateFields.username)
    }
    if (updateFields.avatar_url !== undefined) {
      updateParts.push(`avatar_url = $${i++}`)
      values.push(updateFields.avatar_url)
    }
    if (updateFields.role !== undefined) {
      updateParts.push(`role = $${i++}`)
      values.push(updateFields.role)
    }
    if (updateFields.status !== undefined) {
      updateParts.push(`status = $${i++}`)
      values.push(updateFields.status)
    }
    if (updateFields.must_change_password !== undefined) {
      updateParts.push(`must_change_password = $${i++}`)
      values.push(updateFields.must_change_password)
    }

    if (updateParts.length === 0) {
      return { success: true, data: null, error: null }
    }

    values.push(id)
    const result = await query(
      `UPDATE profiles SET ${updateParts.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    )

    if (result.error) {
      console.error('Error updating user:', result.error)
      return { success: false, error: String(result.error) }
    }

    revalidatePath('/admin/users')

    return { success: true, data: result.data?.[0], error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: '输入验证失败: ' + error.errors[0].message }
    }
    console.error('Unexpected error:', error)
    return { success: false, error: '更新用户时发生错误' }
  }
}

// Ban user
export async function banUser(id: string) {
  try {
    const result = await query(
      "UPDATE profiles SET status = 'banned' WHERE id = $1",
      [id]
    )

    if (result.error) {
      console.error('Error banning user:', result.error)
      return { success: false, error: String(result.error) }
    }

    revalidatePath('/admin/users')

    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: '封禁用户时发生错误' }
  }
}

// Unban user
export async function unbanUser(id: string) {
  try {
    const result = await query(
      "UPDATE profiles SET status = 'active' WHERE id = $1",
      [id]
    )

    if (result.error) {
      console.error('Error unbanning user:', result.error)
      return { success: false, error: String(result.error) }
    }

    revalidatePath('/admin/users')

    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: '解除封禁时发生错误' }
  }
}

// Reset user password
export async function resetUserPassword(id: string, newPassword = '123654') {
  try {
    // Set must_change_password flag and activate user
    const result = await query(
      "UPDATE profiles SET must_change_password = true, status = 'active' WHERE id = $1",
      [id]
    )

    if (result.error) {
      console.error('Error resetting password:', result.error)
      return { success: false, error: '重置密码失败' }
    }

    revalidatePath('/admin/users')

    return {
      success: true,
      message: `密码已重置为: ${newPassword}`,
      error: null
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: '重置密码时发生错误' }
  }
}

// Get user statistics
export async function getUserStats() {
  try {
    const totalResult = await query<{ count: string }>('SELECT COUNT(*) as count FROM profiles')
    const activeResult = await query<{ count: string }>("SELECT COUNT(*) as count FROM profiles WHERE status = 'active'")
    const adminResult = await query<{ count: string }>("SELECT COUNT(*) as count FROM profiles WHERE role = 'admin'")
    const bannedResult = await query<{ count: string }>("SELECT COUNT(*) as count FROM profiles WHERE status = 'banned'")

    return {
      total: parseInt(totalResult.data?.[0]?.count || '0', 10),
      active: parseInt(activeResult.data?.[0]?.count || '0', 10),
      admins: parseInt(adminResult.data?.[0]?.count || '0', 10),
      banned: parseInt(bannedResult.data?.[0]?.count || '0', 10),
      error: null
    }
  } catch (error) {
    console.error('Error getting user stats:', error)
    return {
      total: 0,
      active: 0,
      admins: 0,
      banned: 0,
      error: '获取用户统计时发生错误'
    }
  }
}

// Update own profile
export async function updateOwnProfile(userId: string, updates: {
  username?: string
  avatar_url?: string | null
}) {
  try {
    const updateParts: string[] = []
    const values: any[] = []
    let i = 1

    if (updates.username !== undefined) {
      updateParts.push(`username = $${i++}`)
      values.push(updates.username)
    }
    if (updates.avatar_url !== undefined) {
      updateParts.push(`avatar_url = $${i++}`)
      values.push(updates.avatar_url)
    }

    if (updateParts.length === 0) {
      return { success: true, data: null, error: null }
    }

    values.push(userId)
    const result = await query(
      `UPDATE profiles SET ${updateParts.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    )

    if (result.error) {
      console.error('Error updating profile:', result.error)
      return { success: false, error: String(result.error) }
    }

    revalidatePath('/profile')

    return { success: true, data: result.data?.[0], error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: '更新个人资料时发生错误' }
  }
}
