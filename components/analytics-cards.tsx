'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useExpenses } from '@/lib/expense-store'
import { formatCurrency } from '@/lib/expense-engine'
import { Flame, Clock, TrendingDown, Wallet, CircleDollarSign, ShoppingBag, Sparkles } from 'lucide-react'

export function AnalyticsCards() {
  const { analytics, settings, isLoading } = useExpenses()

  const burnRateColor = analytics.dailyBurnRate > settings.monthlyBudget / 30 
    ? 'text-destructive' 
    : 'text-emerald'

  const daysToBrokeColor = analytics.daysToBroke < 7 
    ? 'text-destructive' 
    : analytics.daysToBroke < 14 
      ? 'text-coral' 
      : 'text-emerald'

  const balancePercentage = (settings.balance / settings.monthlyBudget) * 100

  if (isLoading) {
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
      {/* Total Balance - Hero Card */}
      <Card className="bg-gradient-to-br from-emerald/10 via-teal/5 to-card border-emerald/20 shadow-lg shadow-emerald/5 hover:shadow-emerald/10 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Balance
          </CardTitle>
          <div className="p-2 rounded-xl bg-emerald/10">
            <Wallet className="h-5 w-5 text-emerald" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">
            {formatCurrency(settings.balance)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Available to spend
          </p>
          <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald to-teal transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, balancePercentage))}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Total Spent This Month */}
      <Card className="bg-card border-border/50 shadow-lg shadow-black/5 hover:border-violet/30 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Spent This Month
          </CardTitle>
          <div className="p-2 rounded-xl bg-violet/10">
            <TrendingDown className="h-5 w-5 text-violet" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {formatCurrency(analytics.totalSpent)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {analytics.transactionCount} transactions
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-violet" />
            <span className="text-xs text-muted-foreground">
              Avg: {formatCurrency(analytics.averageTransactionSize)}/transaction
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Daily Burn Rate */}
      <Card className="bg-card border-border/50 shadow-lg shadow-black/5 hover:border-coral/30 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Daily Burn Rate
          </CardTitle>
          <div className={`p-2 rounded-xl ${analytics.dailyBurnRate > settings.monthlyBudget / 30 ? 'bg-destructive/10' : 'bg-coral/10'}`}>
            <Flame className={`h-5 w-5 ${burnRateColor}`} />
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${burnRateColor}`}>
            {formatCurrency(analytics.dailyBurnRate)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Based on last 30 days
          </p>
          <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                analytics.dailyBurnRate > settings.monthlyBudget / 30 
                  ? 'bg-gradient-to-r from-destructive to-coral' 
                  : 'bg-gradient-to-r from-coral to-amber-500'
              }`}
              style={{ width: `${Math.min(100, (analytics.dailyBurnRate / (settings.monthlyBudget / 30)) * 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Days to Broke */}
      <Card className="bg-card border-border/50 shadow-lg shadow-black/5 hover:border-teal/30 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Days Until Broke
          </CardTitle>
          <div className={`p-2 rounded-xl ${analytics.daysToBroke < 7 ? 'bg-destructive/10' : analytics.daysToBroke < 14 ? 'bg-coral/10' : 'bg-emerald/10'}`}>
            <Clock className={`h-5 w-5 ${daysToBrokeColor}`} />
          </div>
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
              <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full font-medium">
                Action needed
              </span>
            )}
            {analytics.daysToBroke >= 14 && analytics.daysToBroke !== Infinity && (
              <span className="text-xs bg-emerald/10 text-emerald px-2 py-1 rounded-full font-medium">
                On track
              </span>
            )}
            {analytics.daysToBroke === Infinity && (
              <span className="text-xs bg-emerald/10 text-emerald px-2 py-1 rounded-full font-medium">
                No spending detected
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Needs */}
      <Card className="bg-card border-border/50 shadow-lg shadow-black/5 hover:border-teal/30 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Needs (Essential)
          </CardTitle>
          <div className="p-2 rounded-xl bg-teal/10">
            <CircleDollarSign className="h-5 w-5 text-teal" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-teal">
            {formatCurrency(analytics.needsTotal)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {analytics.totalSpent > 0 
              ? `${((analytics.needsTotal / analytics.totalSpent) * 100).toFixed(1)}% of total spending`
              : '0% of total spending'
            }
          </p>
          <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-teal to-cyan-400 transition-all duration-500 rounded-full"
              style={{ width: `${analytics.totalSpent > 0 ? (analytics.needsTotal / analytics.totalSpent) * 100 : 0}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Wants */}
      <Card className="bg-card border-border/50 shadow-lg shadow-black/5 hover:border-pink/30 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Wants (Non-Essential)
          </CardTitle>
          <div className="p-2 rounded-xl bg-pink/10">
            <ShoppingBag className="h-5 w-5 text-pink" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-pink">
            {formatCurrency(analytics.wantsTotal)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {analytics.totalSpent > 0 
              ? `${((analytics.wantsTotal / analytics.totalSpent) * 100).toFixed(1)}% of total spending`
              : '0% of total spending'
            }
          </p>
          <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-pink to-rose-400 transition-all duration-500 rounded-full"
              style={{ width: `${analytics.totalSpent > 0 ? (analytics.wantsTotal / analytics.totalSpent) * 100 : 0}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
