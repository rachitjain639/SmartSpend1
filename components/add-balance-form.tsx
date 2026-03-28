'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useExpenses } from '@/lib/expense-store'
import { formatCurrency } from '@/lib/expense-engine'
import { Wallet, Plus, IndianRupee, DollarSign, ArrowRight } from 'lucide-react'
import { USD_TO_INR_RATE } from '@/lib/types'

export function AddBalanceForm() {
  const { addBalance, settings } = useExpenses()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [isUsd, setIsUsd] = useState(false)

  const numericAmount = parseFloat(amount) || 0
  const convertedAmount = isUsd ? Math.round(numericAmount * USD_TO_INR_RATE) : numericAmount

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (convertedAmount <= 0) return

    addBalance(convertedAmount)

    // Reset form
    setAmount('')
    setIsUsd(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 border-emerald/30 text-emerald hover:bg-emerald/10 hover:border-emerald/50 transition-all duration-200"
        >
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline">Add Balance</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald/10">
              <Wallet className="h-5 w-5 text-emerald" />
            </div>
            Add Balance
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Current Balance Display */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald/10 to-teal/10 border border-emerald/20">
            <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(settings.balance)}
            </p>
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
            <Label htmlFor="balance-amount" className="text-foreground">Amount to Add</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {isUsd ? '$' : '₹'}
              </span>
              <Input
                id="balance-amount"
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

          {/* New Balance Preview */}
          {convertedAmount > 0 && (
            <div className="p-3 rounded-lg bg-secondary border border-border">
              <p className="text-sm text-muted-foreground">New Balance will be</p>
              <p className="text-lg font-bold text-emerald">
                {formatCurrency(settings.balance + convertedAmount)}
              </p>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-emerald hover:bg-emerald/90 text-white h-12 text-base font-medium"
            disabled={convertedAmount <= 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add {convertedAmount > 0 ? formatCurrency(convertedAmount) : 'Balance'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
