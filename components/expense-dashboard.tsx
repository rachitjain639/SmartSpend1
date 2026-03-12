'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useExpenses } from '@/lib/expense-store'
import { formatCurrency } from '@/lib/expense-engine'
import { createClient } from '@/lib/supabase/client'
import { AnalyticsCards } from './analytics-cards'
import { TransactionForm } from './transaction-form'
import { TransactionList } from './transaction-list'
import { CategoryChart } from './category-chart'
import { SpendingTrends, MonthlyTrendsList } from './spending-trends'
import { SplitBillUtility } from './split-bill'
import { MonthlySummary } from './monthly-summary'
import Image from 'next/image'
import { LayoutDashboard, PieChart, Receipt, Users, Settings, LogOut, User } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface ExpenseDashboardProps {
  user: SupabaseUser
}

export function ExpenseDashboard({ user }: ExpenseDashboardProps) {
  const router = useRouter()
  const { settings, updateSettings } = useExpenses()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [budget, setBudget] = useState(settings.monthlyBudget.toString())
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'

  const handleSaveSettings = () => {
    updateSettings({ monthlyBudget: parseFloat(budget) || settings.monthlyBudget })
    setSettingsOpen(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image 
                src="/logo.png" 
                alt="SmartSpend Logo" 
                width={48} 
                height={48}
                className="rounded-lg"
              />
              <div>
                <h1 className="text-xl font-bold text-foreground">SmartSpend</h1>
                <p className="text-xs text-muted-foreground">Maximize Your Finances</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* User Info */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-lg">
                <User className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground font-medium">{userName}</span>
              </div>
              
              <TransactionForm />
              <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="border-border text-foreground">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Budget Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="budget" className="text-foreground">Monthly Budget</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          id="budget"
                          type="number"
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          className="pl-7 bg-secondary border-border text-foreground"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Current: {formatCurrency(settings.monthlyBudget)}
                      </p>
                    </div>
                    <Button
                      onClick={handleSaveSettings}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Save Settings
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Logout Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={handleLogout}
                disabled={loggingOut}
                className="border-border text-foreground hover:text-destructive hover:border-destructive/50"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-secondary border border-border p-1 w-full sm:w-auto inline-flex">
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Transactions</span>
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger
              value="split"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Split Bills</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <AnalyticsCards />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <SpendingTrends />
                <TransactionList />
              </div>
              <div className="space-y-6">
                <CategoryChart />
                <MonthlyTrendsList />
              </div>
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TransactionList />
              </div>
              <div>
                <MonthlySummary />
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsCards />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategoryChart />
              <SpendingTrends />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MonthlyTrendsList />
              <MonthlySummary />
            </div>
          </TabsContent>

          {/* Split Bills Tab */}
          <TabsContent value="split" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SplitBillUtility />
              <MonthlySummary />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground">
            SmartSpend - Maximize Your Finances
          </p>
        </div>
      </footer>
    </div>
  )
}
