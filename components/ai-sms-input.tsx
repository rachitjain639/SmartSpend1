'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { parseSMS, extractMerchantCategory } from '@/lib/sms-parser'
import { useExpenses } from '@/lib/expense-store'
import { CATEGORY_CONFIG } from '@/lib/types'
import type { ParsedSMS, Category } from '@/lib/types'
import { Zap, Check, X, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AISMSInputProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AISMSInput({ open, onOpenChange }: AISMSInputProps) {
  const [smsText, setSmsText] = useState('')
  const [parsed, setParsed] = useState<ParsedSMS | null>(null)
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState<Category>('food')
  const [merchant, setMerchant] = useState('')
  const [amount, setAmount] = useState('')
  const { addTransaction } = useExpenses()
  const { toast } = useToast()

  const handleParseSMS = async () => {
    if (!smsText.trim()) {
      toast({ title: 'Error', description: 'Please enter SMS text' })
      return
    }

    setLoading(true)
    try {
      const result = parseSMS(smsText)
      
      if (result.success && result.data) {
        setParsed(result.data)
        setMerchant(result.data.merchant)
        setAmount(result.data.extractedAmount.toString())
        setCategory(result.data.category)
      } else {
        toast({
          title: 'Parsing Failed',
          description: result.error || 'Could not parse SMS'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to parse SMS'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImportTransaction = () => {
    if (!parsed || !merchant || !amount) {
      toast({ title: 'Error', description: 'Please fill all fields' })
      return
    }

    addTransaction({
      amount: parseFloat(amount),
      date: parsed.date,
      category,
      triage: 'want',
      description: merchant,
      paymentMethod: 'upi'
    })

    toast({
      title: 'Success',
      description: `Added ₹${amount} transaction from SMS`
    })

    // Reset
    setSmsText('')
    setParsed(null)
    setMerchant('')
    setAmount('')
    setCategory('food')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            AI SMS Parser
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!parsed ? (
            // SMS Input Stage
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Paste your SMS message
                </label>
                <Textarea
                  value={smsText}
                  onChange={(e) => setSmsText(e.target.value)}
                  placeholder="Example: Paid ₹500 to Pizza Hut. Transaction successful."
                  className="h-32 bg-secondary border-border text-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  Paste banking or transaction SMS messages for automatic expense parsing
                </p>
              </div>

              <Button
                onClick={handleParseSMS}
                disabled={loading || !smsText.trim()}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {loading ? 'Parsing...' : 'Parse SMS with AI'}
              </Button>
            </div>
          ) : (
            // Results & Confirmation Stage
            <div className="space-y-4">
              <div className="bg-secondary/30 border border-border/50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-foreground">Original SMS</h3>
                <p className="text-sm text-muted-foreground italic">{parsed.originalText}</p>

                <div className="pt-2 border-t border-border/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Confidence</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            parsed.confidence > 0.8
                              ? 'bg-emerald-500'
                              : parsed.confidence > 0.6
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${parsed.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{Math.round(parsed.confidence * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Amount</label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-secondary border-border text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Merchant</label>
                  <Input
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    className="bg-secondary border-border text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Category</label>
                <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                  <SelectTrigger className="bg-secondary border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key} className="text-foreground">
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setParsed(null)
                    setSmsText('')
                  }}
                  variant="outline"
                  className="flex-1 border-border"
                >
                  <X className="h-4 w-4 mr-2" />
                  Redo
                </Button>
                <Button
                  onClick={handleImportTransaction}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Add Transaction
                </Button>
              </div>

              {parsed.confidence < 0.7 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-600">
                    Low confidence parsing. Please verify the extracted details before adding.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
