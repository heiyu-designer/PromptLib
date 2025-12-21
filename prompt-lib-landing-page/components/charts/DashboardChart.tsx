"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'

interface DashboardChartProps {
  title: string
  description?: string
  children: React.ReactNode
  loading?: boolean
  error?: string | null
  className?: string
  trend?: {
    value: number
    isPositive: boolean
    label?: string
  }
}

export function DashboardChart({
  title,
  description,
  children,
  loading = false,
  error = null,
  className = "",
  trend
}: DashboardChartProps) {
  const getTrendIcon = () => {
    if (!trend) return null
    const TrendIcon = trend.isPositive ? TrendingUp : TrendingDown
    return (
      <TrendIcon
        className={`h-4 w-4 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}
      />
    )
  }

  const getTrendColor = () => {
    if (!trend) return ''
    return trend.isPositive ? 'text-green-600' : 'text-red-600'
  }

  if (loading) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <Skeleton className="h-6 w-2/3" />
          {description && <Skeleton className="h-4 w-1/2 mt-2" />}
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 animate-pulse text-muted-foreground" />
              <span className="text-sm text-muted-foreground">加载数据中...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${className} transition-all duration-200 hover:shadow-lg`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description && (
              <CardDescription className="text-sm">{description}</CardDescription>
            )}
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="text-sm font-medium">
                {Math.abs(trend.value)}%
                {trend.label && <span className="text-xs ml-1 opacity-75">{trend.label}</span>}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[300px] w-full">
          {children}
        </div>
      </CardContent>
    </Card>
  )
}

export default DashboardChart