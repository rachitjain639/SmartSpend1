import type { Transaction, Category, AnalyticsData, MonthlyTrend } from './types'

/**
 * Engineering Analytics Engine for Student Expense Management
 * Implements optimized algorithms for financial calculations and insights
 */

// Optimized QuickSort for transaction sorting - O(n log n) average case
export function quickSortTransactions(
  transactions: Transaction[],
  key: keyof Transaction,
  ascending = true
): Transaction[] {
  if (transactions.length <= 1) return [...transactions]

  const arr = [...transactions]
  const pivot = arr[Math.floor(arr.length / 2)]
  const pivotValue = pivot[key]

  const compare = (a: Transaction) => {
    const aVal = a[key]
    if (aVal instanceof Date && pivotValue instanceof Date) {
      return ascending ? aVal.getTime() - pivotValue.getTime() : pivotValue.getTime() - aVal.getTime()
    }
    if (typeof aVal === 'number' && typeof pivotValue === 'number') {
      return ascending ? aVal - pivotValue : pivotValue - aVal
    }
    return 0
  }

  const left = arr.filter((t) => compare(t) < 0)
  const middle = arr.filter((t) => compare(t) === 0)
  const right = arr.filter((t) => compare(t) > 0)

  return [...quickSortTransactions(left, key, ascending), ...middle, ...quickSortTransactions(right, key, ascending)]
}

// Binary search for finding transactions in a date range - O(log n)
export function binarySearchDateRange(
  sortedTransactions: Transaction[],
  startDate: Date,
  endDate: Date
): Transaction[] {
  const startTime = startDate.getTime()
  const endTime = endDate.getTime()

  let left = 0
  let right = sortedTransactions.length - 1
  let startIndex = -1

  // Find start index
  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    const midTime = sortedTransactions[mid].date.getTime()

    if (midTime >= startTime) {
      startIndex = mid
      right = mid - 1
    } else {
      left = mid + 1
    }
  }

  if (startIndex === -1) return []

  // Collect all transactions in range
  const result: Transaction[] = []
  for (let i = startIndex; i < sortedTransactions.length; i++) {
    const transTime = sortedTransactions[i].date.getTime()
    if (transTime > endTime) break
    result.push(sortedTransactions[i])
  }

  return result
}

// Calculate Daily Burn Rate using rolling average
export function calculateDailyBurnRate(transactions: Transaction[], days = 30): number {
  const now = new Date()
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  const sortedTransactions = quickSortTransactions(transactions, 'date', true)
  const recentTransactions = binarySearchDateRange(sortedTransactions, startDate, now)

  const totalSpent = recentTransactions.reduce((sum, t) => sum + t.amount, 0)
  const actualDays = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)))

  return totalSpent / actualDays
}

// Calculate Days to Broke - how long until balance reaches zero
export function calculateDaysToBroke(remainingBalance: number, dailyBurnRate: number): number {
  if (dailyBurnRate <= 0) return Infinity
  if (remainingBalance <= 0) return 0
  return Math.floor(remainingBalance / dailyBurnRate)
}

// Category breakdown with percentage calculation
export function calculateCategoryBreakdown(
  transactions: Transaction[]
): { category: Category; amount: number; percentage: number }[] {
  const categoryTotals = new Map<Category, number>()
  let total = 0

  for (const transaction of transactions) {
    const current = categoryTotals.get(transaction.category) || 0
    categoryTotals.set(transaction.category, current + transaction.amount)
    total += transaction.amount
  }

  const breakdown: { category: Category; amount: number; percentage: number }[] = []

  for (const [category, amount] of categoryTotals.entries()) {
    breakdown.push({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0
    })
  }

  // Sort by amount descending
  return breakdown.sort((a, b) => b.amount - a.amount)
}

// Calculate monthly trends with percentage changes
export function calculateMonthlyTrends(transactions: Transaction[]): MonthlyTrend[] {
  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

  const sortedTransactions = quickSortTransactions(transactions, 'date', true)

  const currentMonthTransactions = binarySearchDateRange(sortedTransactions, currentMonthStart, now)
  const previousMonthTransactions = binarySearchDateRange(sortedTransactions, previousMonthStart, previousMonthEnd)

  const currentByCategory = new Map<Category, number>()
  const previousByCategory = new Map<Category, number>()

  for (const t of currentMonthTransactions) {
    currentByCategory.set(t.category, (currentByCategory.get(t.category) || 0) + t.amount)
  }

  for (const t of previousMonthTransactions) {
    previousByCategory.set(t.category, (previousByCategory.get(t.category) || 0) + t.amount)
  }

  const allCategories = new Set([...currentByCategory.keys(), ...previousByCategory.keys()])
  const trends: MonthlyTrend[] = []

  for (const category of allCategories) {
    const current = currentByCategory.get(category) || 0
    const previous = previousByCategory.get(category) || 0

    let percentageChange = 0
    let direction: 'up' | 'down' | 'stable' = 'stable'

    if (previous > 0) {
      percentageChange = ((current - previous) / previous) * 100
      if (percentageChange > 5) direction = 'up'
      else if (percentageChange < -5) direction = 'down'
    } else if (current > 0) {
      percentageChange = 100
      direction = 'up'
    }

    trends.push({
      category,
      currentMonth: current,
      previousMonth: previous,
      percentageChange,
      direction
    })
  }

  return trends.sort((a, b) => Math.abs(b.percentageChange) - Math.abs(a.percentageChange))
}

// Full analytics calculation
export function calculateAnalytics(
  transactions: Transaction[],
  monthlyBudget: number
): AnalyticsData {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const sortedTransactions = quickSortTransactions(transactions, 'date', true)
  const monthTransactions = binarySearchDateRange(sortedTransactions, monthStart, now)

  const totalSpent = monthTransactions.reduce((sum, t) => sum + t.amount, 0)
  const needsTotal = monthTransactions.filter((t) => t.triage === 'need').reduce((sum, t) => sum + t.amount, 0)
  const wantsTotal = monthTransactions.filter((t) => t.triage === 'want').reduce((sum, t) => sum + t.amount, 0)

  const remainingBalance = Math.max(0, monthlyBudget - totalSpent)
  const dailyBurnRate = calculateDailyBurnRate(transactions)
  const daysToBroke = calculateDaysToBroke(remainingBalance, dailyBurnRate)

  return {
    dailyBurnRate,
    daysToBroke,
    totalSpent,
    remainingBalance,
    needsTotal,
    wantsTotal,
    categoryBreakdown: calculateCategoryBreakdown(monthTransactions),
    monthlyTrends: calculateMonthlyTrends(transactions),
    averageTransactionSize: monthTransactions.length > 0 ? totalSpent / monthTransactions.length : 0,
    transactionCount: monthTransactions.length
  }
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Format currency
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(amount)
}

// Format date
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}
