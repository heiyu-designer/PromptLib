"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface TrendCardProps {
  title: string
  value: string | number
  description?: string
  trend?: {
    value: number
    period?: string
  }
  icon?: React.ComponentType<{ className?: string }>
  loading?: boolean
  className?: string
  valueClassName?: string
  sparkline?: React.ReactNode
}

export function TrendCard({
  title,
  value,
  description,
  trend,
  icon: Icon,
  loading = false,
  className = "",
  valueClassName = "",
  sparkline
}: TrendCardProps) {
  const getTrendIcon = () => {
    if (!trend || trend.value === 0) {
      return <Minus className="h-3 w-3 text-muted-foreground" />
    }
    return trend.value > 0 ? (
      <TrendingUp className="h-3 w-3 text-green-600" />
    ) : (
      <TrendingDown className="h-3 w-3 text-red-600" />
    )
  }

  const getTrendColor = () => {
    if (!trend || trend.value === 0) return 'text-muted-foreground'
    return trend.value > 0 ? 'text-green-600' : 'text-red-600'
  }

  if (loading) {
    return (
      <Card className={cn("relative overflow-hidden", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-20" />
          {Icon && <Skeleton className="h-4 w-4 rounded" />}
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="flex-1">
            <div className={cn("text-2xl font-bold", valueClassName)}>
              {value}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
            {trend && (
              <div className={cn("flex items-center space-x-1 mt-2", getTrendColor())}>
                {getTrendIcon()}
                <span className="text-xs font-medium">
                  {Math.abs(trend.value)}%
                  {trend.period && <span className="text-muted-foreground ml-1">vs {trend.period}</span>}
                </span>
              </div>
            )}
          </div>
          {sparkline && (
            <div className="ml-4 h-12 w-20 opacity-70">
              {sparkline}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default TrendCard