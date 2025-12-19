'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { supabaseAdmin, supabase } from '@/lib/supabase'
import { Database } from '@/lib/database'

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

    let query = supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' })

    // Apply filters
    if (params?.role) {
      query = query.eq('role', params.role)
    }

    if (params?.status) {
      query = query.eq('status', params.status)
    }

    if (params?.search) {
      query = query.or(`username.ilike.%${params.search}%,email.ilike.%${params.search}%`)
    }

    // Apply pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching users:', error)
      return { users: [], total: 0, error: error.message }
    }

    return {
      users: data || [],
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
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
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching user:', error)
      return { user: null, error: error.message }
    }

    return { user: data, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { user: null, error: '获取用户时发生错误' }
  }
}

// Update user
export async function updateUser(input: UpdateUserInput) {
  try {
    // Validate input
    const validatedData = updateUserSchema.parse(input)
    const { id, ...updateFields } = validatedData

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      return { success: false, error: error.message }
    }

    // Revalidate cache
    revalidatePath('/admin/users')

    return { success: true, data, error: null }
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
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ status: 'banned' })
      .eq('id', id)

    if (error) {
      console.error('Error banning user:', error)
      return { success: false, error: error.message }
    }

    // Also revoke user's auth sessions
    await supabaseAdmin.auth.admin.signOut(id)

    // Revalidate cache
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
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ status: 'active' })
      .eq('id', id)

    if (error) {
      console.error('Error unbanning user:', error)
      return { success: false, error: error.message }
    }

    // Revalidate cache
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
    // Set must_change_password flag
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        must_change_password: true,
        status: 'active' // Also activate user if they were banned
      })
      .eq('id', id)

    if (profileError) {
      console.error('Error updating user profile:', profileError)
      return { success: false, error: '更新用户资料失败' }
    }

    // Reset password in auth system
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      id,
      { password: newPassword }
    )

    if (authError) {
      console.error('Error resetting password:', authError)
      return { success: false, error: '重置密码失败' }
    }

    // Revalidate cache
    revalidatePath('/admin/users')

    return {
      success: true,
      message: `密码已重置为: ${newPassword}，用户首次登录需要修改密码`,
      error: null
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: '重置密码时发生错误' }
  }
}

// Create admin user (for initial setup)
export async function createAdminUser(email: string, password: string, username?: string) {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username: username || email.split('@')[0]
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return { success: false, error: '创建用户账户失败: ' + authError.message }
    }

    if (!authData.user) {
      return { success: false, error: '创建用户账户失败' }
    }

    // Create profile with admin role
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        username: username || email.split('@')[0],
        role: 'admin',
        status: 'active',
        must_change_password: false,
      })
      .select()
      .single()

    if (profileError) {
      console.error('Error creating user profile:', profileError)
      // Rollback auth user creation
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return { success: false, error: '创建用户资料失败' }
    }

    // Revalidate cache
    revalidatePath('/admin/users')

    return { success: true, user: profileData, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: '创建管理员时发生错误' }
  }
}

// Update user profile (for user themselves)
export async function updateOwnProfile(userId: string, updates: {
  username?: string
  avatar_url?: string | null
}) {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return { success: false, error: error.message }
    }

    // Revalidate cache
    revalidatePath('/profile')

    return { success: true, data, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: '更新个人资料时发生错误' }
  }
}

// Get user statistics
export async function getUserStats() {
  try {
    const [
      { count: totalUsers },
      { count: activeUsers },
      { count: adminUsers },
      { count: bannedUsers }
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'banned')
    ])

    return {
      total: totalUsers || 0,
      active: activeUsers || 0,
      admins: adminUsers || 0,
      banned: bannedUsers || 0,
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