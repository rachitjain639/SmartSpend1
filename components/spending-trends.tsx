'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useExpenses } from '@/lib/expense-store'
import { formatCurrency, quickSortTransactions, binarySearchDateRange } from '@/lib/expense-engine'
import { CATEGORY_CONFIG } from '@/lib/types'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export function SpendingTrends() {
  const { transactions } = useExpenses()

  const dailySpendingData = useMemo(() => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const sortedTransactions = quickSortTransactions(transactions, 'date', true)
    const recentTransactions = binarySearchDateRange(sortedTransactions, thirtyDaysAgo, now)

    // Group by day
    const dailyTotals = new Map<string, number>()
    
    for (const t of recentTransactions) {
      const dateKey = t.date.toISOString().split('T')[0]
      dailyTotals.set(dateKey, (dailyTotals.get(dateKey) || 0) + t.amount)
    }

    // Fill in missing days with 0
    const result: { date: string; amount: number; displayDate: string }[] = []
    const current = new Date(thirtyDaysAgo)
    
    while (current <= now) {
      const dateKey = current.toISOString().split('T')[0]
      result.push({
        date: dateKey,
        amount: dailyTotals.get(dateKey) || 0,
        displayDate: current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      })
      current.setDate(current.getDate() + 1)
    }

    return result
  }, [transactions])

  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <CardTitle className="text-foreground">30-Day Spending Trend</CardTitle>
        <CardDescription className="text-muted-foreground">
          Daily spending over the last month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailySpendingData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4a574" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#d4a574" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#3a3530" vertical={false} />
              <XAxis
                dataKey="displayDate"
                tick={{ fill: '#8a8a8a', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: '#8a8a8a', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<TrendTooltip />} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#d4a574"
                strokeWidth={2}
                fill="url(#colorAmount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function TrendTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-semibold text-foreground mt-1">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  )
}

export function MonthlyTrendsList() {
  const { analytics } = useExpenses()

  if (analytics.monthlyTrends.length === 0) {
    return (
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">Category Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Not enough data to show trends
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <CardTitle className="text-foreground">Category Trends</CardTitle>
        <CardDescription className="text-muted-foreground">
          Compared to last month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {analytics.monthlyTrends.slice(0, 5).map((trend) => (
            <div
              key={trend.category}
              className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-8 rounded-full"
                  style={{ backgroundColor: CATEGORY_CONFIG[trend.category].color }}
                />
                <div>
                  <p className="font-medium text-foreground text-sm">
                    {CATEGORY_CONFIG[trend.category].label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(trend.currentMonth)} this month
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {trend.direction === 'up' && (
                  <>
                    <TrendingUp className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-medium text-destructive">
                      +{trend.percentageChange.toFixed(0)}%
                    </span>
                  </>
                )}
                {trend.direction === 'down' && (
                  <>
                    <TrendingDown className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium text-success">
                      {trend.percentageChange.toFixed(0)}%
                    </span>
                  </>
                )}
                {trend.direction === 'stable' && (
                  <>
                    <Minus className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Stable
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
