"use client"

import { useMemo } from 'react'
import { chartConfig } from '@/components/ui/chart'

export const extendedChartConfig = {
  ...chartConfig,
  prompts: {
    label: "提示词",
    color: "hsl(var(--chart-1))",
  },
  users: {
    label: "用户",
    color: "hsl(var(--chart-2))",
  },
  views: {
    label: "浏览量",
    color: "hsl(var(--chart-3))",
  },
  copies: {
    label: "复制次数",
    color: "hsl(var(--chart-4))",
  },
  tags: {
    label: "标签",
    color: "hsl(var(--chart-5))",
  }
}

export type ChartColorKey = keyof typeof extendedChartConfig

export function useChartConfig() {
  const chartColors = useMemo(() => {
    return {
      primary: [
        "hsl(var(--chart-1))",
        "hsl(var(--chart-2))",
        "hsl(var(--chart-3))",
        "hsl(var(--chart-4))",
        "hsl(var(--chart-5))"
      ],
      secondary: [
        "hsl(var(--muted))",
        "hsl(var(--muted-foreground))",
        "hsl(var(--border))",
        "hsl(var(--input))",
        "hsl(var(--ring))"
      ],
      gradient: {
        blue: {
          start: "hsl(217, 91%, 60%)",
          end: "hsl(217, 91%, 82%)"
        },
        green: {
          start: "hsl(142, 76%, 36%)",
          end: "hsl(142, 76%, 72%)"
        },
        purple: {
          start: "hsl(262, 83%, 58%)",
          end: "hsl(262, 83%, 80%)"
        },
        orange: {
          start: "hsl(25, 95%, 53%)",
          end: "hsl(25, 95%, 75%)"
        }
      }
    }
  }, [])

  const getChartColor = useMemo(() => {
    return (key: ChartColorKey): string => {
      return extendedChartConfig[key]?.color || chartColors.primary[0]
    }
  }, [chartColors.primary])

  const getTrendColor = useMemo(() => {
    return (value: number): string => {
      if (value > 0) return "text-green-600"
      if (value < 0) return "text-red-600"
      return "text-muted-foreground"
    }
  }, [])

  const formatNumber = useMemo(() => {
    return (num: number): string => {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'
      }
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k'
      }
      return num.toString()
    }
  }, [])

  const calculatePercentageChange = useMemo(() => {
    return (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    }
  }, [])

  const lineChartConfig = useMemo(() => {
    return {
      strokeWidth: 2,
      dotRadius: 4,
      activeDotRadius: 6,
      margin: {
        top: 5,
        right: 30,
        left: 20,
        bottom: 5
      }
    }
  }, [])

  const barChartConfig = useMemo(() => {
    return {
      barRadius: [4, 4, 0, 0],
      barGap: 8,
      margin: {
        top: 5,
        right: 30,
        left: 20,
        bottom: 5
      }
    }
  }, [])

  const pieChartConfig = useMemo(() => {
    return {
      innerRadius: 0,
      outerRadius: 80,
      paddingAngle: 0,
      startAngle: 0,
      endAngle: 360
    }
  }, [])

  const getChartTheme = useMemo(() => {
    return {
      background: {
        fill: "hsl(var(--background))"
      },
      text: {
        fill: "hsl(var(--foreground))",
        fontSize: 12
      },
      grid: {
        stroke: "hsl(var(--border))",
        strokeDasharray: "3 3"
      },
      axis: {
        stroke: "hsl(var(--border))"
      },
      tooltip: {
        backgroundColor: "hsl(var(--background))",
        borderColor: "hsl(var(--border))",
        borderRadius: 8,
        padding: 12
      }
    }
  }, [])

  return {
    chartColors,
    getChartColor,
    getTrendColor,
    formatNumber,
    calculatePercentageChange,
    lineChartConfig,
    barChartConfig,
    pieChartConfig,
    getChartTheme,
    extendedChartConfig
  }
}

export default useChartConfig