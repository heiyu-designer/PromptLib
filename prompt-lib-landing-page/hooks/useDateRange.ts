"use client"

import { useState, useCallback } from 'react'

export type TimeRange = 'today' | '7d' | '30d' | '90d' | '1y' | 'custom'

export interface DateRange {
  start: Date
  end: Date
}

export interface TimeRangeOption {
  value: TimeRange
  label: string
  description?: string
}

const timeRangeOptions: TimeRangeOption[] = [
  {
    value: 'today',
    label: '今天',
    description: '今日数据'
  },
  {
    value: '7d',
    label: '7天',
    description: '最近7天'
  },
  {
    value: '30d',
    label: '30天',
    description: '最近30天'
  },
  {
    value: '90d',
    label: '90天',
    description: '最近90天'
  },
  {
    value: '1y',
    label: '1年',
    description: '最近1年'
  },
  {
    value: 'custom',
    label: '自定义',
    description: '自定义时间范围'
  }
]

export function useDateRange(initialTimeRange: TimeRange = '30d') {
  const [timeRange, setTimeRange] = useState<TimeRange>(initialTimeRange)
  const [customDateRange, setCustomDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  })

  const getDateRange = useCallback((range: TimeRange): DateRange => {
    const now = new Date()
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

    switch (range) {
      case 'today':
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
        return { start: startOfDay, end: endOfDay }

      case '7d':
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return { start: sevenDaysAgo, end: endOfDay }

      case '30d':
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        return { start: thirtyDaysAgo, end: endOfDay }

      case '90d':
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        return { start: ninetyDaysAgo, end: endOfDay }

      case '1y':
        const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        return { start: oneYearAgo, end: endOfDay }

      case 'custom':
        return customDateRange

      default:
        return { start: thirtyDaysAgo, end: endOfDay }
    }
  }, [customDateRange])

  const getPreviousDateRange = useCallback((range: TimeRange): DateRange => {
    const current = getDateRange(range)
    const diffMs = current.end.getTime() - current.start.getTime()
    const previousEnd = new Date(current.start.getTime() - 1)
    const previousStart = new Date(previousEnd.getTime() - diffMs + 1)

    return { start: previousStart, end: previousEnd }
  }, [getDateRange])

  const isValidDateRange = useCallback((range: DateRange): boolean => {
    return range.start <= range.end
  }, [])

  const setCustomRange = useCallback((start: Date, end: Date) => {
    if (isValidDateRange({ start, end })) {
      setCustomDateRange({ start, end })
      if (timeRange !== 'custom') {
        setTimeRange('custom')
      }
    }
  }, [timeRange, isValidDateRange])

  const formatForAPI = useCallback((date: Date): string => {
    return date.toISOString()
  }, [])

  const formatDateForDisplay = useCallback((date: Date): string => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }, [])

  const getRangeLabel = useCallback((range: TimeRange): string => {
    const option = timeRangeOptions.find(opt => opt.value === range)
    if (range === 'custom') {
      const customRange = getDateRange(range)
      return `${formatDateForDisplay(customRange.start)} - ${formatDateForDisplay(customRange.end)}`
    }
    return option?.label || range
  }, [getDateRange, formatDateForDisplay])

  const getGranularity = useCallback((range: TimeRange): 'hour' | 'day' | 'week' | 'month' => {
    switch (range) {
      case 'today':
        return 'hour'
      case '7d':
      case '30d':
        return 'day'
      case '90d':
        return 'week'
      case '1y':
        return 'month'
      case 'custom':
        const customRange = getDateRange(range)
        const daysDiff = Math.ceil((customRange.end.getTime() - customRange.start.getTime()) / (1000 * 60 * 60 * 24))
        if (daysDiff <= 1) return 'hour'
        if (daysDiff <= 30) return 'day'
        if (daysDiff <= 90) return 'week'
        return 'month'
      default:
        return 'day'
    }
  }, [getDateRange])

  const changeTimeRange = useCallback((newRange: TimeRange) => {
    setTimeRange(newRange)
  }, [])

  return {
    timeRange,
    customDateRange,
    timeRangeOptions,
    getDateRange,
    getPreviousDateRange,
    setCustomRange,
    formatForAPI,
    formatDateForDisplay,
    getRangeLabel,
    getGranularity,
    changeTimeRange,
    isValidDateRange
  }
}

export default useDateRange