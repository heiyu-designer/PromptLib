"use client"

import { useState, useEffect, useCallback } from 'react'
import { supabaseAdmin } from '@/lib/supabase'

interface TrendData {
  date: string
  prompts: number
  users: number
  views: number
  copies: number
}

interface TagData {
  name: string
  value: number
  slug: string
  color?: string
}

interface PromptData {
  title: string
  views: number
  copies: number
  created_at: string
}

interface UserActivityData {
  date: string
  activeUsers: number
  newUsers: number
  totalActions: number
}

interface DashboardData {
  metrics: {
    totalPrompts: number
    totalTags: number
    totalUsers: number
    totalCopies: number
    weeklyViews: number
    weeklyCopies: number
  }
  trends: TrendData[]
  tagDistribution: TagData[]
  topPrompts: PromptData[]
  userActivity: UserActivityData[]
  loading: boolean
  error: string | null
}

type TimeRange = '7d' | '30d' | '90d' | '1y'

const timeRangeConfig: Record<TimeRange, { days: number; label: string }> = {
  '7d': { days: 7, label: '7天' },
  '30d': { days: 30, label: '30天' },
  '90d': { days: 90, label: '90天' },
  '1y': { days: 365, label: '1年' }
}

export function useDashboardData(initialTimeRange: TimeRange = '30d') {
  const [timeRange, setTimeRange] = useState<TimeRange>(initialTimeRange)
  const [data, setData] = useState<DashboardData>({
    metrics: {
      totalPrompts: 0,
      totalTags: 0,
      totalUsers: 0,
      totalCopies: 0,
      weeklyViews: 0,
      weeklyCopies: 0
    },
    trends: [],
    tagDistribution: [],
    topPrompts: [],
    userActivity: [],
    loading: false,
    error: null
  })

  const formatDate = useCallback((date: Date) => {
    return date.toISOString().split('T')[0]
  }, [])

  const getDateRange = useCallback((days: number) => {
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)
    return {
      start: formatDate(startDate),
      end: formatDate(endDate)
    }
  }, [formatDate])

  const calculateTrends = useCallback(async (days: number): Promise<TrendData[]> => {
    const trends: TrendData[] = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = formatDate(date)
      const nextDateStr = formatDate(new Date(date.getTime() + 24 * 60 * 60 * 1000))

      try {
        // Get prompt counts
        const { count: promptsCount } = await supabaseAdmin
          .from('prompts')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', dateStr)
          .lt('created_at', nextDateStr)

        // Get user counts
        const { count: usersCount } = await supabaseAdmin
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', dateStr)
          .lt('created_at', nextDateStr)

        // Get view counts (sum of view_count for prompts created on this date)
        const { data: viewsData } = await supabaseAdmin
          .from('prompts')
          .select('view_count')
          .gte('created_at', dateStr)
          .lt('created_at', nextDateStr)

        const views = viewsData?.reduce((sum, item) => sum + (item.view_count || 0), 0) || 0

        // Get copy counts
        const { count: copiesCount } = await supabaseAdmin
          .from('copy_events')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', dateStr)
          .lt('created_at', nextDateStr)

        trends.push({
          date: new Date(date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
          prompts: promptsCount || 0,
          users: usersCount || 0,
          views,
          copies: copiesCount || 0
        })
      } catch (error) {
        console.error('Error calculating trends for date:', dateStr, error)
        trends.push({
          date: new Date(date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
          prompts: 0,
          users: 0,
          views: 0,
          copies: 0
        })
      }
    }

    return trends
  }, [formatDate])

  const fetchMetrics = useCallback(async () => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const dateRange = getDateRange(timeRangeConfig[timeRange].days)

    try {
      // Get basic counts
      const [
        promptsResult,
        tagsResult,
        usersResult,
        copiesResult
      ] = await Promise.all([
        supabaseAdmin.from('prompts').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('tags').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('copy_events').select('*', { count: 'exact', head: true })
      ])

      // Get weekly views and copies
      const { data: weeklyViewsData } = await supabaseAdmin
        .from('prompts')
        .select('view_count')
        .gte('created_at', weekAgo.toISOString())

      const { count: weeklyCopiesCount } = await supabaseAdmin
        .from('copy_events')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString())

      const weeklyViews = weeklyViewsData?.reduce((sum, item) => sum + (item.view_count || 0), 0) || 0

      return {
        totalPrompts: promptsResult.count || 0,
        totalTags: tagsResult.count || 0,
        totalUsers: usersResult.count || 0,
        totalCopies: copiesResult.count || 0,
        weeklyViews,
        weeklyCopies: weeklyCopiesCount || 0
      }
    } catch (error) {
      console.error('Error fetching metrics:', error)
      throw error
    }
  }, [timeRange, getDateRange])

  const fetchTagDistribution = useCallback(async () => {
    try {
      // Get all tags with their prompt counts
      const { data: tags, error } = await supabaseAdmin
        .from('tags')
        .select(`
          id,
          name,
          slug,
          color,
          prompt_tags(count)
        `)

      if (error) throw error

      return tags?.map(tag => ({
        name: tag.name,
        value: Array.isArray(tag.prompt_tags) ? tag.prompt_tags.length : 0,
        slug: tag.slug,
        color: tag.color
      })).filter(tag => tag.value > 0) || []

    } catch (error) {
      console.error('Error fetching tag distribution:', error)
      return []
    }
  }, [])

  const fetchTopPrompts = useCallback(async () => {
    try {
      const { data, error } = await supabaseAdmin
        .from('prompts')
        .select('title, view_count, copy_count, created_at')
        .order('view_count', { ascending: false })
        .limit(10)

      if (error) throw error

      return data?.map(prompt => ({
        title: prompt.title,
        views: prompt.view_count || 0,
        copies: prompt.copy_count || 0,
        created_at: prompt.created_at
      })) || []
    } catch (error) {
      console.error('Error fetching top prompts:', error)
      return []
    }
  }, [])

  const fetchUserActivity = useCallback(async () => {
    const days = timeRangeConfig[timeRange].days
    const activities: UserActivityData[] = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = formatDate(date)
      const nextDateStr = formatDate(new Date(date.getTime() + 24 * 60 * 60 * 1000))

      try {
        // Get new users
        const { count: newUsersCount } = await supabaseAdmin
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', dateStr)
          .lt('created_at', nextDateStr)

        // Get total actions (prompts created + copies made)
        const { count: promptsCount } = await supabaseAdmin
          .from('prompts')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', dateStr)
          .lt('created_at', nextDateStr)

        const { count: copiesCount } = await supabaseAdmin
          .from('copy_events')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', dateStr)
          .lt('created_at', nextDateStr)

        activities.push({
          date: new Date(date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
          activeUsers: newUsersCount || 0,
          newUsers: newUsersCount || 0,
          totalActions: (promptsCount || 0) + (copiesCount || 0)
        })
      } catch (error) {
        console.error('Error calculating user activity for date:', dateStr, error)
        activities.push({
          date: new Date(date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
          activeUsers: 0,
          newUsers: 0,
          totalActions: 0
        })
      }
    }

    return activities
  }, [timeRange, formatDate])

  const loadDashboardData = useCallback(async () => {
    setData(prev => ({ ...prev, loading: true, error: null }))

    try {
      const [metrics, trends, tagDistribution, topPrompts, userActivity] = await Promise.all([
        fetchMetrics(),
        calculateTrends(timeRangeConfig[timeRange].days),
        fetchTagDistribution(),
        fetchTopPrompts(),
        fetchUserActivity()
      ])

      setData({
        metrics,
        trends,
        tagDistribution,
        topPrompts,
        userActivity,
        loading: false,
        error: null
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '加载数据失败'
      }))
    }
  }, [timeRange, fetchMetrics, calculateTrends, fetchTagDistribution, fetchTopPrompts, fetchUserActivity])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  return {
    data,
    timeRange,
    setTimeRange,
    timeRangeConfig,
    refreshData: loadDashboardData
  }
}

export default useDashboardData