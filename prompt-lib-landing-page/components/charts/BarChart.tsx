"use client"

import React from 'react'
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  TooltipProps,
  Cell
} from 'recharts'
import { chartConfig } from '@/components/ui/chart'

interface BarChartProps {
  data: any[]
  bars: Array<{
    dataKey: string
    name: string
    color: string
    radius?: [number, number, number, number]
  }>
  xAxisDataKey: string
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  showTooltip?: boolean
  horizontal?: boolean
  margin?: {
    top?: number
    right?: number
    bottom?: number
    left?: number
  }
  className?: string
  dataKey?: string // for custom color mapping
  colorMap?: Record<string, string>
}

const CustomTooltip = ({
  active,
  payload,
  label,
  bars
}: TooltipProps<number, string> & { bars: BarChartProps['bars'] }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium mb-2">{label}</p>
        {payload.map((entry, index) => {
          const barConfig = bars.find(b => b.dataKey === entry.dataKey)
          return (
            <div key={index} className="flex items-center space-x-2 text-xs">
              <div
                className="w-3 h-3 rounded-sm"
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

export function BarChart({
  data,
  bars,
  xAxisDataKey,
  height = 300,
  showGrid = true,
  showLegend = false,
  showTooltip = true,
  horizontal = false,
  margin = { top: 5, right: 30, left: 20, bottom: 5 },
  className = "",
  dataKey,
  colorMap
}: BarChartProps) {
  const CustomBar = (props: any) => {
    const { fill, x, y, width, height, index } = props

    if (dataKey && colorMap && data[index]) {
      const key = data[index][dataKey]
      const color = colorMap[key] || fill
      return <rect x={x} y={y} width={width} height={height} fill={color} />
    }

    return <rect x={x} y={y} width={width} height={height} fill={fill} />
  }

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          margin={margin}
          layout={horizontal ? 'horizontal' : 'vertical'}
        >
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
              content={<CustomTooltip bars={bars} />}
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
              iconType="rect"
            />
          )}
          {bars.map((bar, index) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              radius={bar.radius || [4, 4, 0, 0]}
              shape={dataKey && colorMap ? CustomBar : undefined}
            >
              {!dataKey || !colorMap ? (
                <Cell fill={bar.color} />
              ) : null}
            </Bar>
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default BarChart