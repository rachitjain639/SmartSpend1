import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ExpenseProvider } from '@/lib/expense-store'
import { ExpenseDashboard } from '@/components/expense-dashboard'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <ExpenseProvider>
      <ExpenseDashboard user={user} />
    </ExpenseProvider>
  )
}
