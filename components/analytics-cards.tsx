'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useExpenses } from '@/lib/expense-store'
import { formatCurrency } from '@/lib/expense-engine'
import { Flame, Clock, TrendingDown, Wallet, CircleDollarSign, ShoppingBag } from 'lucide-react'

export function AnalyticsCards() {
  const [mounted, setMounted] = useState(false)
  const { analytics, settings } = useExpenses()

  useEffect(() => {
    setMounted(true)
  }, [])

  const burnRateColor = analytics.dailyBurnRate > settings.monthlyBudget / 30 
    ? 'text-destructive' 
    : 'text-primary'

  const daysToBrokeColor = analytics.daysToBroke < 7 
    ? 'text-destructive' 
    : analytics.daysToBroke < 14 
      ? 'text-warning' 
      : 'text-success'

  const balancePercentage = (analytics.remainingBalance / settings.monthlyBudget) * 100

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-5 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Daily Burn Rate */}
      <Card className="bg-card border-border/50 hover:border-primary/30 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Daily Burn Rate
          </CardTitle>
          <Flame className={`h-5 w-5 ${burnRateColor}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${burnRateColor}`}>
            {formatCurrency(analytics.dailyBurnRate)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Based on last 30 days average
          </p>
          <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min(100, (analytics.dailyBurnRate / (settings.monthlyBudget / 30)) * 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Days to Broke */}
      <Card className="bg-card border-border/50 hover:border-primary/30 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Days to Broke
          </CardTitle>
          <Clock className={`h-5 w-5 ${daysToBrokeColor}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${daysToBrokeColor}`}>
            {analytics.daysToBroke === Infinity ? 'Safe' : `${analytics.daysToBroke} days`}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            At current spending rate
          </p>
          <div className="mt-3 flex items-center gap-2">
            {analytics.daysToBroke < 14 && analytics.daysToBroke !== Infinity && (
              <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded-full">
                Action needed
              </span>
            )}
            {analytics.daysToBroke >= 14 && analytics.daysToBroke !== Infinity && (
              <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full">
                On track
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Remaining Balance */}
      <Card className="bg-card border-border/50 hover:border-primary/30 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Remaining Balance
          </CardTitle>
          <Wallet className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {formatCurrency(analytics.remainingBalance)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            of {formatCurrency(settings.monthlyBudget)} budget
          </p>
          <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-amber-glow transition-all duration-500"
              style={{ width: `${Math.max(0, balancePercentage)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Total Spent */}
      <Card className="bg-card border-border/50 hover:border-primary/30 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Spent This Month
          </CardTitle>
          <TrendingDown className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {formatCurrency(analytics.totalSpent)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {analytics.transactionCount} transactions
          </p>
        </CardContent>
      </Card>

      {/* Needs vs Wants */}
      <Card className="bg-card border-border/50 hover:border-primary/30 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Needs
          </CardTitle>
          <CircleDollarSign className="h-5 w-5 text-need" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-need">
            {formatCurrency(analytics.needsTotal)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {analytics.totalSpent > 0 
              ? `${((analytics.needsTotal / analytics.totalSpent) * 100).toFixed(1)}% of total`
              : '0% of total'
            }
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border/50 hover:border-primary/30 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Wants
          </CardTitle>
          <ShoppingBag className="h-5 w-5 text-want" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-want">
            {formatCurrency(analytics.wantsTotal)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {analytics.totalSpent > 0 
              ? `${((analytics.wantsTotal / analytics.totalSpent) * 100).toFixed(1)}% of total`
              : '0% of total'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
