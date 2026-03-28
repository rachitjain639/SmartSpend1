'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useExpenses } from '@/lib/expense-store'
import { formatCurrency } from '@/lib/expense-engine'
import { AnalyticsCards } from './analytics-cards'
import { TransactionForm } from './transaction-form'
import { AddBalanceForm } from './add-balance-form'
import { TransactionList } from './transaction-list'
import { CategoryChart } from './category-chart'
import { SpendingTrends, MonthlyTrendsList } from './spending-trends'
import { SplitBillUtility } from './split-bill'
import { MonthlySummary } from './monthly-summary'
import { ContactSection } from './contact-section'
import { ThemeToggle } from './theme-toggle'
import Image from 'next/image'
import { LayoutDashboard, PieChart, Receipt, Users, Settings } from 'lucide-react'

export function ExpenseDashboard() {
  const { settings, updateSettings } = useExpenses()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [budget, setBudget] = useState(settings.monthlyBudget.toString())

  const handleSaveSettings = () => {
    updateSettings({ monthlyBudget: parseFloat(budget) || settings.monthlyBudget })
    setSettingsOpen(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image 
                src="/smartspend-logo.png" 
                alt="SmartSpend Logo" 
                width={140} 
                height={60}
                className="h-12 w-auto"
                priority
              />
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Action Buttons */}
              <AddBalanceForm />
              <TransactionForm />
              
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Settings */}
              <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="border-border hover:bg-secondary">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-foreground flex items-center gap-2">
                      <Settings className="h-5 w-5 text-primary" />
                      Budget Settings
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-5 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="budget" className="text-foreground">Monthly Budget</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                        <Input
                          id="budget"
                          type="number"
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          className="pl-8 bg-secondary border-border text-foreground"
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-secondary/50 border border-border p-1.5 w-full sm:w-auto inline-flex rounded-xl">
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-2 rounded-lg transition-all duration-200"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-2 rounded-lg transition-all duration-200"
            >
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Transactions</span>
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-2 rounded-lg transition-all duration-200"
            >
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger
              value="split"
              className="data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-2 rounded-lg transition-all duration-200"
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

      {/* Contact Section / Footer */}
      <ContactSection />
    </div>
  )
}
