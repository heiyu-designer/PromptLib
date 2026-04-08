'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { query } from '@/lib/server-db'

// Settings schema
const settingsSchema = z.object({
  copy_success_message: z.string().min(1, '复制成功消息不能为空').max(200, '消息不能超过200字符'),
  site_name: z.string().min(1, '站点名称不能为空').max(100, '站点名称不能超过100字符'),
  site_description: z.string().min(1, '站点描述不能为空').max(500, '站点描述不能超过500字符'),
  allow_public_submissions: z.boolean().default(false),
  require_approval: z.boolean().default(false),
})

// Types
type Settings = z.infer<typeof settingsSchema>
type CopyEventData = {
  prompt_id: number
  user_id?: string
  ip_address?: string
  user_agent?: string
  referrer?: string
}

// Default settings
const DEFAULT_SETTINGS: Settings = {
  copy_success_message: '✅ 复制成功！关注公众号回复[Coze]获取自动化版',
  site_name: 'PromptLib',
  site_description: '发现高质量 AI 提示词',
  allow_public_submissions: false,
  require_approval: false,
}

// Get current settings
export async function getSettings() {
  try {
    const result = await query<{ settings: Settings }>(
      'SELECT settings FROM settings WHERE id = 1'
    )

    if (result.error) {
      console.error('Error fetching settings:', result.error)
      return { settings: DEFAULT_SETTINGS, error: String(result.error) }
    }

    if (!result.data || result.data.length === 0) {
      return { settings: DEFAULT_SETTINGS, error: null }
    }

    const settingsData = result.data[0].settings
    const settings = typeof settingsData === 'string'
      ? JSON.parse(settingsData)
      : settingsData

    return { settings: { ...DEFAULT_SETTINGS, ...settings }, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { settings: DEFAULT_SETTINGS, error: '获取设置时发生错误' }
  }
}

// Update settings
export async function updateSettings(settings: Partial<Settings>) {
  try {
    // Validate settings
    const validatedData = settingsSchema.partial().parse(settings)

    // Get current settings first
    const { settings: currentSettings } = await getSettings()
    const mergedSettings = { ...currentSettings, ...validatedData }

    // Upsert settings
    const result = await query(
      `INSERT INTO settings (id, settings) VALUES (1, $1)
       ON CONFLICT (id) DO UPDATE SET settings = $1`,
      [JSON.stringify(mergedSettings)]
    )

    if (result.error) {
      console.error('Error updating settings:', result.error)
      return { success: false, error: String(result.error) }
    }

    // Revalidate cache
    revalidatePath('/admin/settings')

    return { success: true, settings: mergedSettings, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: '设置验证失败: ' + error.errors[0].message }
    }
    console.error('Unexpected error:', error)
    return { success: false, error: '更新设置时发生错误' }
  }
}

// Track copy event
export async function trackCopy(event: CopyEventData) {
  try {
    // Create copy tracking record
    const result = await query(
      `INSERT INTO copy_events (prompt_id, user_id, ip_address, user_agent, referrer)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        event.prompt_id,
        event.user_id || null,
        event.ip_address || null,
        event.user_agent || null,
        event.referrer || null
      ]
    )

    if (result.error) {
      console.error('Error tracking copy event:', result.error)
      return { success: false, error: String(result.error) }
    }

    // Increment prompt copy count
    await query(
      'UPDATE prompts SET copy_count = copy_count + 1 WHERE id = $1',
      [event.prompt_id]
    )

    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: '记录复制事件时发生错误' }
  }
}

// Get copy statistics
export async function getCopyStats(promptId?: number, days = 30) {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    let sql = 'SELECT * FROM copy_events WHERE created_at >= $1'
    const params: any[] = [startDate.toISOString()]

    if (promptId) {
      sql += ' AND prompt_id = $2'
      params.push(promptId)
    }

    sql += ' ORDER BY created_at DESC'

    const result = await query<{
      id: number
      prompt_id: number
      user_id: string | null
      ip_address: string | null
      created_at: string
    }>(sql, params)

    if (result.error) {
      console.error('Error fetching copy stats:', result.error)
      return { stats: null, error: String(result.error) }
    }

    const data = result.data || []
    const uniqueUsers = new Set(data.map(event => event.user_id).filter(Boolean))
    const dailyStats = data.reduce((acc, event) => {
      const date = event.created_at.split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      stats: {
        totalCopies: data.length,
        uniqueUsers: uniqueUsers.size,
        dailyStats: dailyStats || {},
        promptId,
        days
      },
      error: null
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { stats: null, error: '获取复制统计时发生错误' }
  }
}

// Initialize settings table
export async function initializeSettings() {
  try {
    const result = await query(
      `INSERT INTO settings (id, settings) VALUES (1, $1)
       ON CONFLICT (id) DO NOTHING`,
      [JSON.stringify(DEFAULT_SETTINGS)]
    )

    if (result.error) {
      console.error('Error initializing settings:', result.error)
      return { success: false, error: String(result.error) }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: '初始化设置时发生错误' }
  }
}
