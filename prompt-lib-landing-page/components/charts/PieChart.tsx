"use client"

import React from 'react'
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  TooltipProps
} from 'recharts'
import { cn } from '@/lib/utils'

interface PieChartProps {
  data: Array<{
    name: string
    value: number
    color?: string
  }>
  height?: number
  showTooltip?: boolean
  showLegend?: boolean
  innerRadius?: number
  outerRadius?: number
  paddingAngle?: number
  className?: string
  colors?: string[]
}

const CustomTooltip = ({
  active,
  payload
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0]
    const total = payload.reduce((sum, entry) => sum + (entry.value as number), 0)
    const percentage = ((data.value as number) / total * 100).toFixed(1)

    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium">{data.name}</p>
        <p className="text-xs text-muted-foreground">
          {typeof data.value === 'number' ? data.value.toLocaleString() : data.value} ({percentage}%)
        </p>
      </div>
    )
  }
  return null
}

const CustomLegend = ({ data }: { data: PieChartProps['data'] }) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center mt-4">
      {data.map((entry, index) => (
        <div key={index} className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-muted-foreground">{entry.name}</span>
        </div>
      ))}
    </div>
  )
}

export function PieChart({
  data,
  height = 300,
  showTooltip = true,
  showLegend = true,
  innerRadius = 0,
  outerRadius = 80,
  paddingAngle = 0,
  className = "",
  colors = []
}: PieChartProps) {
  const defaultColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  const chartColors = colors.length > 0 ? colors : defaultColors

  const dataWithColors = data.map((entry, index) => ({
    ...entry,
    color: entry.color || chartColors[index % chartColors.length]
  }))

  const renderCustomLabel = (entry: any) => {
    const percent = ((entry.value / data.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(0)
    if (percent < 5) return null // Don't show labels for very small slices
    return `${percent}%`
  }

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={dataWithColors}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={paddingAngle}
            dataKey="value"
          >
            {dataWithColors.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          {showTooltip && (
            <Tooltip
              content={<CustomTooltip />}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
      {showLegend && data.length > 0 && (
        <CustomLegend data={dataWithColors} />
      )}
    </div>
  )
}

export default PieChart