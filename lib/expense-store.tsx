'use client'

import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from 'react'
import type { Transaction, Category, TriageType, SplitBill, UserSettings, AnalyticsData, PaymentMethod, ParsedSMS, Reminder, ChatMessage } from './types'
import { calculateAnalytics, generateId } from './expense-engine'

interface ExpenseContextType {
  transactions: Transaction[]
  splitBills: SplitBill[]
  parsedSMS: ParsedSMS[]
  reminders: Reminder[]
  chatMessages: ChatMessage[]
  settings: UserSettings
  analytics: AnalyticsData
  isLoading: boolean
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  addSplitBill: (bill: Omit<SplitBill, 'id'>) => void
  updateSplitBill: (id: string, updates: Partial<SplitBill>) => void
  deleteSplitBill: (id: string) => void
  addParsedSMS: (sms: ParsedSMS) => void
  deleteParsedSMS: (id: string) => void
  addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt'>) => void
  updateReminder: (id: string, updates: Partial<Reminder>) => void
  deleteReminder: (id: string) => void
  sendChatMessage: (message: Omit<ChatMessage, 'id' | 'isRead'>) => void
  updateSettings: (updates: Partial<UserSettings>) => void
  addBalance: (amount: number) => void
  addCustomCategory: (category: string) => void
}

const ExpenseContext = createContext<ExpenseContextType | null>(null)

// Sample data generator for demo
function generateSampleData(): Transaction[] {
  const categories: Category[] = ['food', 'transport', 'entertainment', 'education', 'housing', 'utilities', 'health', 'clothing', 'subscriptions', 'shopping', 'bills', 'other']
  const paymentMethods: PaymentMethod[] = ['cash', 'online', 'upi', 'card']
  const descriptions: Record<Category, string[]> = {
    food: ['Grocery shopping', 'Coffee shop', 'Lunch with friends', 'Pizza delivery', 'Breakfast sandwich'],
    transport: ['Bus pass', 'Uber ride', 'Gas station', 'Parking fee', 'Metro card'],
    entertainment: ['Movie tickets', 'Video game', 'Concert', 'Streaming service', 'Books'],
    education: ['Textbooks', 'Online course', 'Study materials', 'Printing costs', 'Software license'],
    housing: ['Monthly rent', 'Room supplies', 'Furniture', 'Cleaning supplies', 'Decor'],
    utilities: ['Electricity bill', 'Internet service', 'Phone bill', 'Water bill', 'Heating'],
    health: ['Gym membership', 'Medicine', 'Doctor visit', 'Vitamins', 'Sports equipment'],
    clothing: ['New shoes', 'Winter jacket', 'T-shirts', 'Jeans', 'Accessories'],
    subscriptions: ['Spotify', 'Netflix', 'Amazon Prime', 'Cloud storage', 'News subscription'],
    shopping: ['Amazon order', 'Flipkart sale', 'Electronics', 'Home decor', 'Gadgets'],
    bills: ['Credit card bill', 'Insurance', 'Loan EMI', 'Mobile recharge', 'DTH recharge'],
    other: ['Gift for friend', 'Miscellaneous', 'Emergency expense', 'Lost item replacement', 'Donation']
  }

  const transactions: Transaction[] = []
  const now = new Date()

  // Generate 60 days of transactions
  for (let i = 0; i < 60; i++) {
    const dayOffset = Math.floor(Math.random() * 60)
    const date = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000)
    
    // 1-3 transactions per iteration
    const numTransactions = Math.floor(Math.random() * 3) + 1
    
    for (let j = 0; j < numTransactions; j++) {
      const category = categories[Math.floor(Math.random() * categories.length)]
      const descOptions = descriptions[category]
      const description = descOptions[Math.floor(Math.random() * descOptions.length)]
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
      
      // Amount varies by category (in INR)
      let baseAmount = 500
      if (category === 'housing') baseAmount = 15000
      else if (category === 'education') baseAmount = 2000
      else if (category === 'utilities') baseAmount = 1500
      else if (category === 'subscriptions') baseAmount = 500
      else if (category === 'food') baseAmount = 400
      else if (category === 'transport') baseAmount = 300
      else if (category === 'entertainment') baseAmount = 800
      else if (category === 'health') baseAmount = 1200
      else if (category === 'clothing') baseAmount = 1500
      else if (category === 'shopping') baseAmount = 2000
      else if (category === 'bills') baseAmount = 3000

      const amount = baseAmount + Math.random() * baseAmount * 0.5

      transactions.push({
        id: generateId(),
        amount: Math.round(amount * 100) / 100,
        date,
        category,
        triage: Math.random() > 0.4 ? 'need' : 'want',
        description,
        paymentMethod,
        createdAt: date,
        updatedAt: date
      })
    }
  }

  return transactions
}

// Default analytics to avoid hydration mismatch
const defaultAnalytics: AnalyticsData = {
  totalSpent: 0,
  dailyBurnRate: 0,
  daysToBroke: Infinity,
  remainingBalance: 0,
  needsTotal: 0,
  wantsTotal: 0,
  needsWantsRatio: { needs: 0, wants: 0 },
  categoryBreakdown: [],
  monthlyTrends: [],
  averageTransactionSize: 0,
  transactionCount: 0
}

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [splitBills, setSplitBills] = useState<SplitBill[]>([])
  const [parsedSMS, setParsedSMS] = useState<ParsedSMS[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [settings, setSettings] = useState<UserSettings>({
    monthlyBudget: 50000,
    savingsGoal: 10000,
    currency: 'INR',
    balance: 100000,
    customCategories: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Generate sample data only on client after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
    const sampleData = generateSampleData()
    setTransactions(sampleData)
    setIsLoading(false)
  }, [])

  const analytics = useMemo(() => {
    if (!mounted) return defaultAnalytics
    return calculateAnalytics(transactions, settings.monthlyBudget, settings.balance)
  }, [transactions, settings.monthlyBudget, settings.balance, mounted])

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date()
    const newTransaction: Transaction = {
      ...transaction,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    }
    setTransactions((prev) => [...prev, newTransaction])
    // Deduct from balance
    setSettings((prev) => ({
      ...prev,
      balance: Math.max(0, prev.balance - transaction.amount)
    }))
  }, [])

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, ...updates, updatedAt: new Date() }
          : t
      )
    )
  }, [])

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => {
      const transaction = prev.find(t => t.id === id)
      if (transaction) {
        // Refund to balance
        setSettings((s) => ({
          ...s,
          balance: s.balance + transaction.amount
        }))
      }
      return prev.filter((t) => t.id !== id)
    })
  }, [])

  const addSplitBill = useCallback((bill: Omit<SplitBill, 'id'>) => {
    const newBill: SplitBill = {
      ...bill,
      id: generateId(),
      messages: bill.messages || [],
      status: bill.status || 'pending'
    }
    setSplitBills((prev) => [...prev, newBill])
  }, [])

  const updateSplitBill = useCallback((id: string, updates: Partial<SplitBill>) => {
    setSplitBills((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, ...updates } : b
      )
    )
  }, [])

  const deleteSplitBill = useCallback((id: string) => {
    setSplitBills((prev) => prev.filter((b) => b.id !== id))
  }, [])

  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }))
  }, [])

  const addBalance = useCallback((amount: number) => {
    setSettings((prev) => ({
      ...prev,
      balance: prev.balance + amount
    }))
  }, [])

  const addCustomCategory = useCallback((category: string) => {
    setSettings((prev) => ({
      ...prev,
      customCategories: [...prev.customCategories, category]
    }))
  }, [])

  // SMS Parsing Methods
  const addParsedSMS = useCallback((sms: ParsedSMS) => {
    setParsedSMS((prev) => [...prev, sms])
  }, [])

  const deleteParsedSMS = useCallback((id: string) => {
    setParsedSMS((prev) => prev.filter((s) => s.id !== id))
  }, [])

  // Reminder Methods
  const addReminder = useCallback((reminder: Omit<Reminder, 'id' | 'createdAt'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: generateId(),
      createdAt: new Date()
    }
    setReminders((prev) => [...prev, newReminder])
  }, [])

  const updateReminder = useCallback((id: string, updates: Partial<Reminder>) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    )
  }, [])

  const deleteReminder = useCallback((id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id))
  }, [])

  // Chat Message Methods
  const sendChatMessage = useCallback((message: Omit<ChatMessage, 'id' | 'isRead'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateId(),
      isRead: false
    }
    setChatMessages((prev) => [...prev, newMessage])
  }, [])

  const value: ExpenseContextType = {
    transactions,
    splitBills,
    parsedSMS,
    reminders,
    chatMessages,
    settings,
    analytics,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addSplitBill,
    updateSplitBill,
    deleteSplitBill,
    addParsedSMS,
    deleteParsedSMS,
    addReminder,
    updateReminder,
    deleteReminder,
    sendChatMessage,
    updateSettings,
    addBalance,
    addCustomCategory
  }

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  )
}

export function useExpenses() {
  const context = useContext(ExpenseContext)
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider')
  }
  return context
}
