'use client'

import { ExpenseProvider } from '@/lib/expense-store'
import { ExpenseDashboard } from '@/components/expense-dashboard'

export default function Home() {
  return (
    <ExpenseProvider>
      <ExpenseDashboard />
    </ExpenseProvider>
  )
}
