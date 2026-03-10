// Core Transaction Types for Student Expense Management

export type TriageType = 'need' | 'want'

export type Category = 
  | 'food'
  | 'transport'
  | 'entertainment'
  | 'education'
  | 'housing'
  | 'utilities'
  | 'health'
  | 'clothing'
  | 'subscriptions'
  | 'other'

export interface Transaction {
  id: string
  amount: number
  date: Date
  category: Category
  triage: TriageType
  description: string
  createdAt: Date
  updatedAt: Date
}

export interface SplitBillParticipant {
  id: string
  name: string
  share: number
  paid: boolean
}

export interface SplitBill {
  id: string
  totalAmount: number
  description: string
  date: Date
  participants: SplitBillParticipant[]
  paidBy: string
}

export interface MonthlyTrend {
  category: Category
  currentMonth: number
  previousMonth: number
  percentageChange: number
  direction: 'up' | 'down' | 'stable'
}

export interface AnalyticsData {
  dailyBurnRate: number
  daysToBroke: number
  totalSpent: number
  remainingBalance: number
  needsTotal: number
  wantsTotal: number
  categoryBreakdown: { category: Category; amount: number; percentage: number }[]
  monthlyTrends: MonthlyTrend[]
  averageTransactionSize: number
  transactionCount: number
}

export interface UserSettings {
  monthlyBudget: number
  savingsGoal: number
  currency: string
}

// Category metadata for display
export const CATEGORY_CONFIG: Record<Category, { label: string; icon: string; color: string }> = {
  food: { label: 'Food & Dining', icon: 'UtensilsCrossed', color: '#d4a574' },
  transport: { label: 'Transportation', icon: 'Car', color: '#8b7355' },
  entertainment: { label: 'Entertainment', icon: 'Gamepad2', color: '#c4956a' },
  education: { label: 'Education', icon: 'GraduationCap', color: '#9a8b7a' },
  housing: { label: 'Housing & Rent', icon: 'Home', color: '#b8956e' },
  utilities: { label: 'Utilities', icon: 'Zap', color: '#a68b6a' },
  health: { label: 'Health & Fitness', icon: 'Heart', color: '#c98b6a' },
  clothing: { label: 'Clothing', icon: 'Shirt', color: '#b39574' },
  subscriptions: { label: 'Subscriptions', icon: 'CreditCard', color: '#8a7a65' },
  other: { label: 'Other', icon: 'MoreHorizontal', color: '#7a6a55' }
}
