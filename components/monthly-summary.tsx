'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useExpenses } from '@/lib/expense-store'
import { formatCurrency } from '@/lib/expense-engine'
import { CATEGORY_CONFIG, type Category } from '@/lib/types'
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Lightbulb, ArrowRight } from 'lucide-react'

export function MonthlySummary() {
  const { analytics, settings } = useExpenses()

  const insights = useMemo(() => {
    const messages: { type: 'warning' | 'success' | 'tip'; message: string; icon: React.ReactNode }[] = []

    // Budget status
    const spentPercentage = (analytics.totalSpent / settings.monthlyBudget) * 100
    if (spentPercentage > 90) {
      messages.push({
        type: 'warning',
        message: `You've used ${spentPercentage.toFixed(0)}% of your monthly budget. Consider reducing non-essential spending.`,
        icon: <AlertTriangle className="h-5 w-5 text-destructive" />
      })
    } else if (spentPercentage < 50) {
      messages.push({
        type: 'success',
        message: `Great job! You've only used ${spentPercentage.toFixed(0)}% of your budget with plenty of room to spare.`,
        icon: <CheckCircle className="h-5 w-5 text-success" />
      })
    }

    // Wants vs Needs ratio
    const wantsRatio = analytics.totalSpent > 0 ? (analytics.wantsTotal / analytics.totalSpent) * 100 : 0
    if (wantsRatio > 40) {
      messages.push({
        type: 'tip',
        message: `${wantsRatio.toFixed(0)}% of your spending is on wants. Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.`,
        icon: <Lightbulb className="h-5 w-5 text-primary" />
      })
    }

    // Burn rate warning
    if (analytics.daysToBroke < 14 && analytics.daysToBroke !== Infinity) {
      messages.push({
        type: 'warning',
        message: `At your current rate, you'll run out of budget in ${analytics.daysToBroke} days. Time to cut back!`,
        icon: <AlertTriangle className="h-5 w-5 text-destructive" />
      })
    }

    // Category trends
    const increasingCategories = analytics.monthlyTrends.filter(
      (t) => t.direction === 'up' && t.percentageChange > 20
    )
    if (increasingCategories.length > 0) {
      const category = increasingCategories[0]
      messages.push({
        type: 'warning',
        message: `${CATEGORY_CONFIG[category.category].label} spending is up ${category.percentageChange.toFixed(0)}% compared to last month.`,
        icon: <TrendingUp className="h-5 w-5 text-destructive" />
      })
    }

    const decreasingCategories = analytics.monthlyTrends.filter(
      (t) => t.direction === 'down' && t.percentageChange < -20
    )
    if (decreasingCategories.length > 0) {
      const category = decreasingCategories[0]
      messages.push({
        type: 'success',
        message: `Nice! ${CATEGORY_CONFIG[category.category].label} spending is down ${Math.abs(category.percentageChange).toFixed(0)}% from last month.`,
        icon: <TrendingDown className="h-5 w-5 text-success" />
      })
    }

    return messages.slice(0, 4)
  }, [analytics, settings])

  const topCategories = analytics.categoryBreakdown.slice(0, 4)

  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <CardTitle className="text-foreground">Monthly Financial Summary</CardTitle>
        <CardDescription className="text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Budget Overview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Budget Used</span>
            <span className="text-sm font-medium text-foreground">
              {formatCurrency(analytics.totalSpent)} / {formatCurrency(settings.monthlyBudget)}
            </span>
          </div>
          <Progress
            value={Math.min(100, (analytics.totalSpent / settings.monthlyBudget) * 100)}
            className="h-3 bg-secondary"
          />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-xs text-muted-foreground">Daily Average</p>
            <p className="text-lg font-semibold text-foreground mt-1">
              {formatCurrency(analytics.dailyBurnRate)}
            </p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-xs text-muted-foreground">Transactions</p>
            <p className="text-lg font-semibold text-foreground mt-1">
              {analytics.transactionCount}
            </p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-xs text-muted-foreground">Avg Transaction</p>
            <p className="text-lg font-semibold text-foreground mt-1">
              {formatCurrency(analytics.averageTransactionSize)}
            </p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-xs text-muted-foreground">Remaining</p>
            <p className="text-lg font-semibold text-foreground mt-1">
              {formatCurrency(analytics.remainingBalance)}
            </p>
          </div>
        </div>

        {/* Top Spending Categories */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Top Spending Categories</h4>
          {topCategories.map((item) => (
            <div key={item.category} className="flex items-center gap-3">
              <div
                className="w-2 h-8 rounded-full"
                style={{ backgroundColor: CATEGORY_CONFIG[item.category].color }}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-foreground">
                    {CATEGORY_CONFIG[item.category].label}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
                <Progress
                  value={item.percentage}
                  className="h-1.5 bg-secondary"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Smart Insights */}
        {insights.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Smart Insights</h4>
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    insight.type === 'warning'
                      ? 'bg-destructive/10 border border-destructive/20'
                      : insight.type === 'success'
                        ? 'bg-success/10 border border-success/20'
                        : 'bg-primary/10 border border-primary/20'
                  }`}
                >
                  {insight.icon}
                  <p className="text-sm text-foreground">{insight.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Needs vs Wants Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Needs vs Wants</h4>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-need">Needs</span>
                <span className="text-xs text-muted-foreground">
                  {analytics.totalSpent > 0
                    ? ((analytics.needsTotal / analytics.totalSpent) * 100).toFixed(0)
                    : 0}%
                </span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-need transition-all duration-500"
                  style={{
                    width: `${analytics.totalSpent > 0 ? (analytics.needsTotal / analytics.totalSpent) * 100 : 0}%`
                  }}
                />
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-want">Wants</span>
                <span className="text-xs text-muted-foreground">
                  {analytics.totalSpent > 0
                    ? ((analytics.wantsTotal / analytics.totalSpent) * 100).toFixed(0)
                    : 0}%
                </span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-want transition-all duration-500"
                  style={{
                    width: `${analytics.totalSpent > 0 ? (analytics.wantsTotal / analytics.totalSpent) * 100 : 0}%`
                  }}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Needs: {formatCurrency(analytics.needsTotal)}
            </span>
            <span className="text-muted-foreground">
              Wants: {formatCurrency(analytics.wantsTotal)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
