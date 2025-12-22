'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'

// Type assertion to avoid TypeScript issues with Supabase
declare global {
  namespace SupabaseTypes {
    interface Database {
      public: any
    }
  }
}

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
    // For now, we'll store settings in a simple key-value format
    // In a real application, you might want a dedicated settings table

    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('*')
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching settings:', error)
      return { settings: DEFAULT_SETTINGS, error: error.message }
    }

    // If no settings found, return defaults
    if (!data) {
      return { settings: DEFAULT_SETTINGS, error: null }
    }

    // Parse settings from JSON if needed
    const settingsData = data as any
    const settings = typeof settingsData.settings === 'string'
      ? JSON.parse(settingsData.settings)
      : settingsData.settings

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
    const { data, error } = await supabaseAdmin
      .from('settings')
      .upsert({
        id: 1, // Use a fixed ID for simplicity
        settings: mergedSettings
      } as any)
      .select()
      .single()

    if (error) {
      console.error('Error updating settings:', error)
      return { success: false, error: error.message }
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
    const { error } = await supabaseAdmin
      .from('copy_events')
      .insert({
        prompt_id: event.prompt_id,
        user_id: event.user_id || null,
        ip_address: event.ip_address || null,
        user_agent: event.user_agent || null,
        referrer: event.referrer || null
      })

    if (error) {
      console.error('Error tracking copy event:', error)
      return { success: false, error: error.message }
    }

    // Increment prompt copy count (if you have this field)
    await supabaseAdmin.rpc('increment_copy_count', {
      prompt_id: event.prompt_id
    }).catch(() => {
      // Fallback if RPC function doesn't exist
      console.log('Copy tracking RPC function not found, skipping count increment')
    })

    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: '记录复制事件时发生错误' }
  }
}

// Get copy statistics
export async function getCopyStats(promptId?: number, days = 30) {
  try {
    let query = supabaseAdmin
      .from('copy_events')
      .select('*', { count: 'exact' })

    // Filter by prompt ID if provided
    if (promptId) {
      query = query.eq('prompt_id', promptId)
    }

    // Filter by date range
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    query = query
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching copy stats:', error)
      return { stats: null, error: error.message }
    }

    // Calculate additional stats
    const uniqueUsers = new Set(data?.map(event => event.user_id).filter(Boolean))
    const dailyStats = data?.reduce((acc, event) => {
      const date = event.created_at.split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      stats: {
        totalCopies: count || 0,
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

// Get popular prompts by copy count
export async function getPopularPromptsByCopies(limit = 10, days = 30) {
  try {
    // This query would be more efficient with a proper materialized view
    // but for simplicity, we'll use a basic approach

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabaseAdmin
      .from('copy_events')
      .select(`
        prompt_id,
        prompts(title, created_at),
        count
      `)
      .gte('created_at', startDate.toISOString())
      .order('count', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching popular prompts:', error)
      return { prompts: [], error: error.message }
    }

    return { prompts: data || [], error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { prompts: [], error: '获取热门提示词时发生错误' }
  }
}

// Initialize settings table (run this once during setup)
export async function initializeSettings() {
  try {
    const { error } = await supabaseAdmin
      .from('settings')
      .upsert({
        id: 1,
        settings: DEFAULT_SETTINGS
      })

    if (error) {
      console.error('Error initializing settings:', error)
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: '初始化设置时发生错误' }
  }
}