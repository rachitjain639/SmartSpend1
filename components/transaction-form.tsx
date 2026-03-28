'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useExpenses } from '@/lib/expense-store'
import type { Category, TriageType, PaymentMethod } from '@/lib/types'
import { CATEGORY_CONFIG, PAYMENT_CONFIG, USD_TO_INR_RATE } from '@/lib/types'
import { formatCurrency } from '@/lib/expense-engine'
import { 
  Plus, UtensilsCrossed, Car, Gamepad2, GraduationCap, Home, Zap, Heart, 
  Shirt, CreditCard, MoreHorizontal, ShoppingBag, Receipt, Banknote, 
  Globe, Smartphone, DollarSign, IndianRupee, ArrowRight, Sparkles
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
  cash: <Banknote className="h-4 w-4" />,
  online: <Globe className="h-4 w-4" />,
  upi: <Smartphone className="h-4 w-4" />,
  card: <CreditCard className="h-4 w-4" />
}

interface TransactionFormProps {
  onSuccess?: () => void
}

export function TransactionForm({ onSuccess }: TransactionFormProps) {
  const { addTransaction, settings, addCustomCategory } = useExpenses()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Category>('food')
  const [customCategory, setCustomCategory] = useState('')
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [triage, setTriage] = useState<TriageType>('need')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [isUsd, setIsUsd] = useState(false)

  const numericAmount = parseFloat(amount) || 0
  const convertedAmount = isUsd ? Math.round(numericAmount * USD_TO_INR_RATE) : numericAmount

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (convertedAmount <= 0 || !description) return

    // Add custom category if provided
    if (showCustomCategory && customCategory.trim()) {
      addCustomCategory(customCategory.trim())
    }

    addTransaction({
      amount: convertedAmount,
      description,
      category,
      customCategory: showCustomCategory ? customCategory.trim() : undefined,
      triage,
      paymentMethod,
      date: new Date(date)
    })

    // Reset form
    setAmount('')
    setDescription('')
    setCategory('food')
    setCustomCategory('')
    setShowCustomCategory(false)
    setTriage('need')
    setPaymentMethod('upi')
    setDate(new Date().toISOString().split('T')[0])
    setIsUsd(false)
    setOpen(false)
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Expense</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            Add New Expense
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Balance Display */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
            <p className="text-xs text-muted-foreground">Available Balance</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(settings.balance)}</p>
          </div>

          {/* Currency Toggle */}
          <div className="flex items-center gap-2 p-1 bg-secondary rounded-lg">
            <button
              type="button"
              onClick={() => setIsUsd(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                !isUsd 
                  ? 'bg-card text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <IndianRupee className="h-4 w-4" />
              INR
            </button>
            <button
              type="button"
              onClick={() => setIsUsd(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                isUsd 
                  ? 'bg-card text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <DollarSign className="h-4 w-4" />
              USD
            </button>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-foreground">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">
                {isUsd ? '$' : '₹'}
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 bg-secondary border-border text-foreground text-lg h-12"
                required
              />
            </div>
          </div>

          {/* Conversion Display */}
          {isUsd && numericAmount > 0 && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-violet/10 border border-violet/20">
              <div className="flex items-center gap-1 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>{numericAmount.toFixed(2)}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-violet" />
              <div className="flex items-center gap-1 font-semibold text-foreground">
                <IndianRupee className="h-4 w-4" />
                <span>{convertedAmount.toLocaleString('en-IN')}</span>
              </div>
              <span className="text-xs text-muted-foreground ml-auto">
                @{USD_TO_INR_RATE}
              </span>
            </div>
          )}

          {/* Description Input */}
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

          {/* Category Select */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="category" className="text-foreground">Category</Label>
              <button
                type="button"
                onClick={() => setShowCustomCategory(!showCustomCategory)}
                className="text-xs text-primary hover:text-primary/80 transition-colors"
              >
                {showCustomCategory ? 'Use preset' : '+ Custom'}
              </button>
            </div>
            {showCustomCategory ? (
              <Input
                placeholder="Enter custom category"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="bg-secondary border-border text-foreground"
              />
            ) : (
              <Select value={category} onValueChange={(value: Category) => setCategory(value)}>
                <SelectTrigger className="bg-secondary border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-[200px]">
                  {(Object.keys(CATEGORY_CONFIG) as Category[]).map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-foreground">
                      <div className="flex items-center gap-2">
                        <span style={{ color: CATEGORY_CONFIG[cat].color }}>
                          {categoryIcons[cat]}
                        </span>
                        <span>{CATEGORY_CONFIG[cat].label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label className="text-foreground">Payment Method</Label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(PAYMENT_CONFIG) as PaymentMethod[]).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 ${
                    paymentMethod === method
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-secondary text-muted-foreground hover:border-primary/50 hover:bg-secondary/80'
                  }`}
                >
                  <span style={{ color: paymentMethod === method ? PAYMENT_CONFIG[method].color : undefined }}>
                    {paymentIcons[method]}
                  </span>
                  <span className="text-xs font-medium">{PAYMENT_CONFIG[method].label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Input */}
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

          {/* Need/Want Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-secondary border border-border">
            <div className="space-y-0.5">
              <Label htmlFor="triage" className="text-foreground font-medium">Is this a Need or Want?</Label>
              <p className="text-xs text-muted-foreground">
                {triage === 'need' ? 'Essential expense' : 'Non-essential expense'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${triage === 'need' ? 'text-teal' : 'text-muted-foreground'}`}>
                Need
              </span>
              <Switch
                id="triage"
                checked={triage === 'want'}
                onCheckedChange={(checked) => setTriage(checked ? 'want' : 'need')}
                className="data-[state=checked]:bg-pink data-[state=unchecked]:bg-teal"
              />
              <span className={`text-sm font-medium ${triage === 'want' ? 'text-pink' : 'text-muted-foreground'}`}>
                Want
              </span>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-medium shadow-lg shadow-primary/20"
            disabled={convertedAmount <= 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Expense {convertedAmount > 0 ? `(${formatCurrency(convertedAmount)})` : ''}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
