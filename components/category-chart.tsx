'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useExpenses } from '@/lib/expense-store'
import { formatCurrency } from '@/lib/expense-engine'
import { CATEGORY_CONFIG, type Category } from '@/lib/types'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

// Golden Hour color palette for chart segments
const CHART_COLORS = [
  '#d4a574', // warm amber
  '#c4956a', // golden tan
  '#b8956e', // caramel
  '#a68b6a', // warm bronze
  '#9a8b7a', // dusty gold
  '#8b7355', // deep amber
  '#c98b6a', // sunset orange
  '#b39574', // wheat
  '#8a7a65', // olive amber
  '#7a6a55', // dark bronze
]

interface ChartDataItem {
  name: string
  value: number
  category: Category
  color: string
  percentage: number
}

export function CategoryChart() {
  const { analytics, isLoading } = useExpenses()

  const chartData = useMemo<ChartDataItem[]>(() => {
    return analytics.categoryBreakdown
      .filter((item) => item.amount > 0)
      .map((item, index) => ({
        name: CATEGORY_CONFIG[item.category].label,
        value: item.amount,
        category: item.category,
        color: CHART_COLORS[index % CHART_COLORS.length],
        percentage: item.percentage
      }))
  }, [analytics.categoryBreakdown])

  if (isLoading) {
    return (
      <Card className="bg-card border-border/50">
        <CardHeader>
          <Skeleton className="h-6 w-44" />
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <Skeleton className="h-[200px] w-[200px] rounded-full" />
        </CardContent>
      </Card>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">Spending by Category</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No spending data yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <CardTitle className="text-foreground">Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                content={<CustomLegend data={chartData} />}
                verticalAlign="bottom"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartDataItem }> }) {
  if (!active || !payload?.length) return null

  const data = payload[0].payload

  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
      <p className="font-medium text-foreground">{data.name}</p>
      <p className="text-sm text-muted-foreground mt-1">
        {formatCurrency(data.value)} ({data.percentage.toFixed(1)}%)
      </p>
    </div>
  )
}

function CustomLegend({ data }: { data: ChartDataItem[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-3 mt-4">
      {data.slice(0, 5).map((item, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-xs text-muted-foreground">{item.name}</span>
        </div>
      ))}
      {data.length > 5 && (
        <span className="text-xs text-muted-foreground">+{data.length - 5} more</span>
      )}
    </div>
  )
}
