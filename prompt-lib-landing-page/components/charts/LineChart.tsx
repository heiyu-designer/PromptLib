"use client"

import React from 'react'
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  TooltipProps
} from 'recharts'
import { chartConfig } from '@/components/ui/chart'

interface LineChartProps {
  data: any[]
  lines: Array<{
    dataKey: string
    name: string
    color: string
    strokeWidth?: number
    strokeDasharray?: string
  }>
  xAxisDataKey: string
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  showTooltip?: boolean
  margin?: {
    top?: number
    right?: number
    bottom?: number
    left?: number
  }
  className?: string
}

const CustomTooltip = ({
  active,
  payload,
  label,
  lines
}: TooltipProps<number, string> & { lines: LineChartProps['lines'] }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium mb-2">{label}</p>
        {payload.map((entry, index) => {
          const lineConfig = lines.find(l => l.dataKey === entry.dataKey)
          return (
            <div key={index} className="flex items-center space-x-2 text-xs">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="font-medium">{entry.name}:</span>
              <span>{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}</span>
            </div>
          )
        })}
      </div>
    )
  }
  return null
}

export function LineChart({
  data,
  lines,
  xAxisDataKey,
  height = 300,
  showGrid = true,
  showLegend = false,
  showTooltip = true,
  margin = { top: 5, right: 30, left: 20, bottom: 5 },
  className = ""
}: LineChartProps) {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={data} margin={margin}>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-muted/30"
            />
          )}
          <XAxis
            dataKey={xAxisDataKey}
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          {showTooltip && (
            <Tooltip
              content={<CustomTooltip lines={lines} />}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
          )}
          {showLegend && (
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              iconType="line"
            />
          )}
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color}
              strokeWidth={line.strokeWidth || 2}
              strokeDasharray={line.strokeDasharray}
              name={line.name}
              dot={false}
              activeDot={{
                r: 4,
                className: 'stroke-background stroke-2'
              }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default LineChart