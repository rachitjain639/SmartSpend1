'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useExpenses } from '@/lib/expense-store'
import { formatCurrency, getTransactionsForPeriod, calculateCategoryBreakdown } from '@/lib/expense-engine'
import { CATEGORY_CONFIG, type Category } from '@/lib/types'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { CalendarDays, TrendingUp } from 'lucide-react'

// Vibrant Gen-Z color palette for chart segments
const CHART_COLORS = [
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#ec4899', // pink
  '#3b82f6', // blue
  '#14b8a6', // teal
  '#f97316', // orange
  '#a855f7', // purple
  '#06b6d4', // cyan
  '#ef4444', // red
  '#6366f1', // indigo
  '#64748b', // slate
]

interface ChartDataItem {
  name: string
  value: number
  category: Category
  color: string
  percentage: number
}

type FilterPeriod = 'monthly' | 'quarterly'

export function CategoryChart() {
  const { transactions, isLoading } = useExpenses()
  const [period, setPeriod] = useState<FilterPeriod>('monthly')

  const chartData = useMemo<ChartDataItem[]>(() => {
    const filteredTransactions = getTransactionsForPeriod(transactions, period)
    const breakdown = calculateCategoryBreakdown(filteredTransactions)
    
    return breakdown
      .filter((item) => item.amount > 0)
      .map((item, index) => ({
        name: CATEGORY_CONFIG[item.category]?.label || item.category,
        value: item.amount,
        category: item.category,
        color: CATEGORY_CONFIG[item.category]?.color || CHART_COLORS[index % CHART_COLORS.length],
        percentage: item.percentage
      }))
  }, [transactions, period])

  const totalSpent = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0)
  }, [chartData])

  if (isLoading) {
    return (
      <Card className="bg-card border-border/50 shadow-lg shadow-black/5">
        <CardHeader>
          <Skeleton className="h-6 w-44" />
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[350px]">
          <Skeleton className="h-[200px] w-[200px] rounded-full" />
        </CardContent>
      </Card>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card className="bg-card border-border/50 shadow-lg shadow-black/5">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Spending by Category
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[350px] gap-3">
          <div className="p-4 rounded-full bg-secondary">
            <CalendarDays className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-center">No spending data for this period</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border/50 shadow-lg shadow-black/5 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Spending by Category
          </CardTitle>
          {/* Period Filter */}
          <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg">
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                period === 'monthly'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setPeriod('quarterly')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                period === 'quarterly'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Quarterly
            </button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Total: {formatCurrency(totalSpent)}
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {chartData.map((entry, index) => (
                  <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                    <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
                animationBegin={0}
                animationDuration={800}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`url(#gradient-${index})`}
                    style={{
                      filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))',
                      cursor: 'pointer'
                    }}
                  />
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
        {/* Center Stats */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginTop: '-80px' }}>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {period === 'monthly' ? 'This Month' : 'Last 3 Months'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartDataItem }> }) {
  if (!active || !payload?.length) return null

  const data = payload[0].payload

  return (
    <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-xl p-4 shadow-xl">
      <div className="flex items-center gap-2 mb-2">
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: data.color }}
        />
        <p className="font-semibold text-foreground">{data.name}</p>
      </div>
      <div className="space-y-1">
        <p className="text-lg font-bold text-foreground">
          {formatCurrency(data.value)}
        </p>
        <p className="text-sm text-muted-foreground">
          {data.percentage.toFixed(1)}% of total
        </p>
      </div>
    </div>
  )
}

function CustomLegend({ data }: { data: ChartDataItem[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 px-2">
      {data.slice(0, 6).map((item, index) => (
        <div key={index} className="flex items-center gap-1.5 group cursor-pointer">
          <div
            className="w-3 h-3 rounded-full transition-transform group-hover:scale-125"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
            {item.name}
          </span>
          <span className="text-xs font-medium text-foreground">
            {item.percentage.toFixed(0)}%
          </span>
        </div>
      ))}
      {data.length > 6 && (
        <span className="text-xs text-muted-foreground">+{data.length - 6} more</span>
      )}
    </div>
  )
}
