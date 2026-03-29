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
  | 'shopping'
  | 'bills'
  | 'other'

export type PaymentMethod = 'cash' | 'online' | 'upi' | 'card'

export interface Transaction {
  id: string
  amount: number
  date: Date
  category: Category
  triage: TriageType
  description: string
  paymentMethod?: PaymentMethod
  customCategory?: string
  createdAt: Date
  updatedAt: Date
}

export interface SplitBillParticipant {
  id: string
  name: string
  share: number
  paid: boolean
}

export interface SplitMessage {
  id: string
  author: string
  text: string
  mentions: string[]
  timestamp: Date
  type: 'message' | 'reminder' | 'status_update'
}

export interface SplitBill {
  id: string
  totalAmount: number
  description: string
  date: Date
  participants: SplitBillParticipant[]
  paidBy: string
  messages: SplitMessage[]
  status: 'pending' | 'partially_settled' | 'settled'
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
  needsWantsRatio: { needs: number; wants: number }
  categoryBreakdown: { category: Category; amount: number; percentage: number }[]
  monthlyTrends: MonthlyTrend[]
  averageTransactionSize: number
  transactionCount: number
}

export interface UserSettings {
  monthlyBudget: number
  savingsGoal: number
  currency: string
  balance: number
  customCategories: string[]
}

// Category metadata for display - Gen-Z vibrant colors
export const CATEGORY_CONFIG: Record<Category, { label: string; icon: string; color: string }> = {
  food: { label: 'Food & Dining', icon: 'UtensilsCrossed', color: '#10b981' },
  transport: { label: 'Transportation', icon: 'Car', color: '#8b5cf6' },
  entertainment: { label: 'Entertainment', icon: 'Gamepad2', color: '#f59e0b' },
  education: { label: 'Education', icon: 'GraduationCap', color: '#3b82f6' },
  housing: { label: 'Housing & Rent', icon: 'Home', color: '#ec4899' },
  utilities: { label: 'Utilities', icon: 'Zap', color: '#14b8a6' },
  health: { label: 'Health & Fitness', icon: 'Heart', color: '#ef4444' },
  clothing: { label: 'Clothing', icon: 'Shirt', color: '#a855f7' },
  subscriptions: { label: 'Subscriptions', icon: 'CreditCard', color: '#06b6d4' },
  shopping: { label: 'Shopping', icon: 'ShoppingBag', color: '#f97316' },
  bills: { label: 'Bills', icon: 'Receipt', color: '#6366f1' },
  other: { label: 'Other', icon: 'MoreHorizontal', color: '#64748b' }
}

// Payment method configuration
export const PAYMENT_CONFIG: Record<PaymentMethod, { label: string; icon: string; color: string }> = {
  cash: { label: 'Cash', icon: 'Banknote', color: '#10b981' },
  online: { label: 'Online', icon: 'Globe', color: '#3b82f6' },
  upi: { label: 'UPI', icon: 'Smartphone', color: '#8b5cf6' },
  card: { label: 'Card', icon: 'CreditCard', color: '#f59e0b' }
}

// USD to INR conversion rate (approximate)
export const USD_TO_INR_RATE = 83.50

// AI SMS Parsing Types
export interface ParsedSMS {
  id: string
  originalText: string
  extractedAmount: number
  merchant: string
  category: Category
  date: Date
  confidence: number
  paymentMethod?: PaymentMethod
  createdAt: Date
}

export interface SMSParseResult {
  success: boolean
  data?: ParsedSMS
  error?: string
  confidence?: number
}

// Reminder Types
export type ReminderStatus = 'pending' | 'sent' | 'confirmed' | 'completed'
export type ReminderType = 'split' | 'personal' | 'payment'
export type ReminderFrequency = 'once' | 'daily' | 'every_2_days' | 'weekly'

export interface Reminder {
  id: string
  type: ReminderType
  title: string
  message: string
  relatedId?: string // Split bill ID or other entity ID
  members?: SplitBillParticipant[]
  status: ReminderStatus
  dueDate: Date
  frequency: ReminderFrequency
  nextReminder?: Date
  isRead: boolean
  createdAt: Date
}

export interface ChatMessage {
  id: string
  reminderId: string
  sender: string
  text: string
  timestamp: Date
  isRead: boolean
  type: 'message' | 'system' | 'reminder_sent'
}
