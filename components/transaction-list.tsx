'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useExpenses } from '@/lib/expense-store'
import { quickSortTransactions, formatCurrency, formatDate } from '@/lib/expense-engine'
import type { Category, Transaction } from '@/lib/types'
import { CATEGORY_CONFIG } from '@/lib/types'
import { Trash2, Search, ArrowUpDown, UtensilsCrossed, Car, Gamepad2, GraduationCap, Home, Zap, Heart, Shirt, CreditCard, MoreHorizontal } from 'lucide-react'

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
  other: <MoreHorizontal className="h-4 w-4" />
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
          CATEGORY_CONFIG[t.category].label.toLowerCase().includes(term)
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
    <Card className="bg-card border-border/50">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-foreground">Recent Transactions</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-secondary border-border text-foreground w-full sm:w-[200px]"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(value: Category | 'all') => setCategoryFilter(value)}>
              <SelectTrigger className="bg-secondary border-border text-foreground w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all" className="text-foreground">All Categories</SelectItem>
                {(Object.keys(CATEGORY_CONFIG) as Category[]).map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-foreground">
                    {CATEGORY_CONFIG[cat].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortKey} onValueChange={(value: 'date' | 'amount') => setSortKey(value)}>
              <SelectTrigger className="bg-secondary border-border text-foreground w-[110px]">
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
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {filteredAndSortedTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found
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
  return (
    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors group">
      <div className="flex items-center gap-3">
        <div
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${CATEGORY_CONFIG[transaction.category].color}20` }}
        >
          <span style={{ color: CATEGORY_CONFIG[transaction.category].color }}>
            {categoryIcons[transaction.category]}
          </span>
        </div>
        <div>
          <p className="font-medium text-foreground text-sm">{transaction.description}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground">
              {formatDate(transaction.date)}
            </span>
            <Badge
              variant="outline"
              className={`text-xs px-1.5 py-0 ${
                transaction.triage === 'need'
                  ? 'border-need/50 text-need bg-need/10'
                  : 'border-want/50 text-want bg-want/10'
              }`}
            >
              {transaction.triage}
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-semibold text-foreground">
          {formatCurrency(transaction.amount)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(transaction.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
