'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useExpenses } from '@/lib/expense-store'
import { quickSortTransactions, formatCurrency, formatDate } from '@/lib/expense-engine'
import type { Category, Transaction, PaymentMethod } from '@/lib/types'
import { CATEGORY_CONFIG, PAYMENT_CONFIG } from '@/lib/types'
import { 
  Trash2, Search, ArrowUpDown, UtensilsCrossed, Car, Gamepad2, GraduationCap, 
  Home, Zap, Heart, Shirt, CreditCard, MoreHorizontal, ShoppingBag, Receipt,
  Banknote, Globe, Smartphone, List
} from 'lucide-react'

const categoryIcons: Record<Category, React.ReactNode> = {
  food: <UtensilsCrossed className="h-4 w-4" />,
  transport: <Car className="h-4 w-4" />,
  entertainment: <Gamepad2 className="h-4 w-4" />,
  education: <GraduationCap className="h-4 w-4" />,
  housing: <Home className="h-4 w-4" />,
  utilities: <Zap className="h-4 w-4" />,
  health: <Heart className="h-4 w-4" />,
  clothing: <Shirt className="h-4 w-4" />,
  subscriptions: <CreditCard className="h-4 w-4" />,
  shopping: <ShoppingBag className="h-4 w-4" />,
  bills: <Receipt className="h-4 w-4" />,
  other: <MoreHorizontal className="h-4 w-4" />
}

const paymentIcons: Record<PaymentMethod, React.ReactNode> = {
  cash: <Banknote className="h-3 w-3" />,
  online: <Globe className="h-3 w-3" />,
  upi: <Smartphone className="h-3 w-3" />,
  card: <CreditCard className="h-3 w-3" />
}

export function TransactionList() {
  const { transactions, deleteTransaction } = useExpenses()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all')
  const [sortKey, setSortKey] = useState<'date' | 'amount'>('date')
  const [sortAsc, setSortAsc] = useState(false)

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(term) ||
          CATEGORY_CONFIG[t.category]?.label.toLowerCase().includes(term)
      )
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((t) => t.category === categoryFilter)
    }

    // Apply optimized sorting
    return quickSortTransactions(filtered, sortKey, sortAsc)
  }, [transactions, searchTerm, categoryFilter, sortKey, sortAsc])

  const toggleSort = () => {
    setSortAsc(!sortAsc)
  }

  const handleDelete = (id: string) => {
    deleteTransaction(id)
  }

  return (
    <Card className="bg-card border-border/50 shadow-lg shadow-black/5">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-foreground flex items-center gap-2">
            <List className="h-5 w-5 text-primary" />
            Recent Transactions
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-secondary border-border text-foreground w-full sm:w-[180px]"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(value: Category | 'all') => setCategoryFilter(value)}>
              <SelectTrigger className="bg-secondary border-border text-foreground w-[130px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border max-h-[250px]">
                <SelectItem value="all" className="text-foreground">All Categories</SelectItem>
                {(Object.keys(CATEGORY_CONFIG) as Category[]).map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-foreground">
                    {CATEGORY_CONFIG[cat].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortKey} onValueChange={(value: 'date' | 'amount') => setSortKey(value)}>
              <SelectTrigger className="bg-secondary border-border text-foreground w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="date" className="text-foreground">Date</SelectItem>
                <SelectItem value="amount" className="text-foreground">Amount</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleSort}
              className="border-border text-foreground hover:bg-secondary"
            >
              <ArrowUpDown className={`h-4 w-4 transition-transform ${sortAsc ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2">
          {filteredAndSortedTransactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="p-4 rounded-full bg-secondary inline-block mb-3">
                <Receipt className="h-8 w-8" />
              </div>
              <p>No transactions found</p>
            </div>
          ) : (
            filteredAndSortedTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function TransactionItem({
  transaction,
  onDelete
}: {
  transaction: Transaction
  onDelete: (id: string) => void
}) {
  const categoryConfig = CATEGORY_CONFIG[transaction.category] || CATEGORY_CONFIG.other
  const paymentConfig = transaction.paymentMethod ? PAYMENT_CONFIG[transaction.paymentMethod] : null

  return (
    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl hover:bg-secondary transition-all duration-200 group">
      <div className="flex items-center gap-3">
        <div
          className="p-2.5 rounded-xl transition-transform group-hover:scale-105"
          style={{ backgroundColor: `${categoryConfig.color}15` }}
        >
          <span style={{ color: categoryConfig.color }}>
            {categoryIcons[transaction.category] || categoryIcons.other}
          </span>
        </div>
        <div>
          <p className="font-medium text-foreground text-sm">{transaction.description}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-muted-foreground">
              {formatDate(transaction.date)}
            </span>
            <Badge
              variant="outline"
              className={`text-xs px-1.5 py-0 ${
                transaction.triage === 'need'
                  ? 'border-teal/50 text-teal bg-teal/10'
                  : 'border-pink/50 text-pink bg-pink/10'
              }`}
            >
              {transaction.triage}
            </Badge>
            {paymentConfig && (
              <Badge
                variant="outline"
                className="text-xs px-1.5 py-0 border-border bg-card text-muted-foreground gap-1"
              >
                {transaction.paymentMethod && paymentIcons[transaction.paymentMethod]}
                {paymentConfig.label}
              </Badge>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-bold text-foreground">
          {formatCurrency(transaction.amount)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(transaction.id)}
          className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
