'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useExpenses } from '@/lib/expense-store'
import type { Category, TriageType } from '@/lib/types'
import { CATEGORY_CONFIG } from '@/lib/types'
import { Plus, UtensilsCrossed, Car, Gamepad2, GraduationCap, Home, Zap, Heart, Shirt, CreditCard, MoreHorizontal } from 'lucide-react'

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

interface TransactionFormProps {
  onSuccess?: () => void
}

export function TransactionForm({ onSuccess }: TransactionFormProps) {
  const { addTransaction } = useExpenses()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Category>('food')
  const [triage, setTriage] = useState<TriageType>('need')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || !description) return

    addTransaction({
      amount: parseFloat(amount),
      description,
      category,
      triage,
      date: new Date(date)
    })

    // Reset form
    setAmount('')
    setDescription('')
    setCategory('food')
    setTriage('need')
    setDate(new Date().toISOString().split('T')[0])
    setOpen(false)
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-foreground">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7 bg-secondary border-border text-foreground"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">Description</Label>
            <Input
              id="description"
              placeholder="What did you spend on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-secondary border-border text-foreground"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-foreground">Category</Label>
            <Select value={category} onValueChange={(value: Category) => setCategory(value)}>
              <SelectTrigger className="bg-secondary border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {(Object.keys(CATEGORY_CONFIG) as Category[]).map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-foreground">
                    <div className="flex items-center gap-2">
                      {categoryIcons[cat]}
                      <span>{CATEGORY_CONFIG[cat].label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-foreground">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-secondary border-border text-foreground"
              required
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label htmlFor="triage" className="text-foreground">Is this a Need or Want?</Label>
              <p className="text-xs text-muted-foreground">
                {triage === 'need' ? 'Essential expense' : 'Non-essential expense'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${triage === 'need' ? 'text-need font-medium' : 'text-muted-foreground'}`}>
                Need
              </span>
              <Switch
                id="triage"
                checked={triage === 'want'}
                onCheckedChange={(checked) => setTriage(checked ? 'want' : 'need')}
                className="data-[state=checked]:bg-want data-[state=unchecked]:bg-need"
              />
              <span className={`text-sm ${triage === 'want' ? 'text-want font-medium' : 'text-muted-foreground'}`}>
                Want
              </span>
            </div>
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            Add Expense
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
